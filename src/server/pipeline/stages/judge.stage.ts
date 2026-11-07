import 'server-only';

import pLimit from 'p-limit';

import { buildJudgePrompt, JUDGE_SYSTEM } from '@/lib/ai/prompts/judge.prompt';
import { callStructured } from '@/lib/ai/structured.util';
import { judgeOutputSchema } from '@/schema/judge.schema';
import { brandAliases, brandLabel, mentionsBrand } from '@/server/judge/brand.util';
import { classifyCitations, ownRoute } from '@/server/judge/classify-source.util';
import { listAnswers, listJudgments, listQuestions, saveJudgment } from '@/server/repositories/answer.repo';
import { addCompetitors, listCompetitors, listFacts } from '@/server/repositories/fact-sheet.repo';
import { listPageSummaries } from '@/server/repositories/page.repo';
import { RATING_PLATFORMS } from '@/types/enums/fact.enum';

import type { IPipelineStage } from '../pipeline-context.type';

/** Stage 6: each answer checked against the confirmed fact sheet. */
export const judgeStage: IPipelineStage = {
  key: 'judge',
  async run(ctx) {
    const scan = await ctx.refresh();
    const version = scan.fact_sheet_version;
    const [answers, judgments, questions, facts, competitors, pages] = await Promise.all([
      listAnswers(scan.id),
      listJudgments(scan.id),
      listQuestions(scan.id),
      listFacts(scan.id),
      listCompetitors(scan.id),
      listPageSummaries(scan.id),
    ]);

    const judgedAt = new Map(judgments.map(j => [j.answer_id, j.fact_sheet_version]));
    const todo = answers.filter(a => a.status === 'ok' && judgedAt.get(a.id) !== version);
    const questionById = new Map(questions.map(q => [q.id, q]));
    const host = new URL(scan.origin).hostname;
    const brand = brandLabel(scan);
    const aliases = brandAliases(scan, facts);
    const routes = [...new Set(pages.filter(p => !p.fetch_error).map(p => p.route))];
    const confirmed = facts
      .filter(f => f.confirmed && f.value)
      .map(f => ({ key: f.key, label: f.label, value: f.value! }));
    const knownCompetitors = competitors.map(c => c.name);
    const factKeys = new Set(facts.map(f => f.key));

    const total = answers.filter(a => a.status === 'ok').length;
    let done = total - todo.length;
    await ctx.progress({ done, total });

    const limit = pLimit(ctx.env.JUDGE_CONCURRENCY);
    const discovered = new Set<string>();
    let stopped = false;

    await Promise.all(
      todo.map(answer =>
        limit(async () => {
          if (stopped) return;
          if (await ctx.shouldStop()) {
            stopped = true;
            return;
          }
          const q = questionById.get(answer.question_id);
          if (!q) return;
          const citationUrls = answer.citations.map(c => c.url);
          try {
            const out = await callStructured(
              judgeOutputSchema,
              buildJudgePrompt({
                brand,
                aliases,
                intent: q.intent,
                question: q.text,
                answer: answer.raw_text ?? '',
                citations: citationUrls,
                routes,
                facts: confirmed,
                competitors: knownCompetitors,
              }),
              { system: JUDGE_SYSTEM, temperature: 0, fast: false },
            );

            // Ground truth checks the model cannot be trusted with.
            const mentioned = out.mentioned || mentionsBrand(answer.raw_text ?? '', aliases);
            const position = !mentioned ? 'absent' : out.position === 'absent' ? 'listed' : out.position;
            const cited = [...new Set(citationUrls.map(u => ownRoute(u, host)).filter((r): r is string => !!r))];
            const shouldCite = out.should_cite_route.trim();

            await saveJudgment(
              {
                answer_id: answer.id,
                scan_id: scan.id,
                fact_sheet_version: version,
                mentioned,
                mention_position: position,
                cited_our_pages: cited,
                should_cite_route: !shouldCite || shouldCite.toLowerCase() === 'none' ? null : shouldCite,
                why: out.why.trim() || null,
                sentiment: mentioned ? out.sentiment : 'na',
                competitors_mentioned: out.competitors_mentioned.filter(n => !aliases.some(a => a.toLowerCase() === n.toLowerCase())),
                source_classes: classifyCitations(citationUrls, host, knownCompetitors),
                ratings_quoted: out.ratings_quoted
                  .filter(r => (RATING_PLATFORMS as readonly string[]).includes(r.platform) && r.value > 0 && r.value <= 5)
                  .map(r => ({ platform: r.platform, value: r.value, count: r.count > 0 ? r.count : null })),
                positive_themes: out.positive_themes,
                negative_themes: out.negative_themes,
                review_sources: out.review_sources,
              },
              mentioned
                ? out.claims.map(c => ({
                    scan_id: scan.id,
                    engine: answer.engine,
                    text: c.text,
                    kind: c.kind,
                    // A "wrong" verdict must point at a confirmed fact.
                    verdict: c.verdict === 'wrong' && !confirmed.some(f => f.key === c.fact_key) ? 'unverifiable' : c.verdict,
                    fact_key: factKeys.has(c.fact_key) ? c.fact_key : null,
                    fact_value: confirmed.find(f => f.key === c.fact_key)?.value ?? null,
                    suggested_correction: c.suggested_correction.trim() || null,
                  }))
                : [],
            );
            out.competitors_mentioned.forEach(n => {
              if (!knownCompetitors.some(k => k.toLowerCase() === n.toLowerCase()) && !aliases.some(a => a.toLowerCase() === n.toLowerCase())) {
                discovered.add(n.trim());
              }
            });
          } catch (error) {
            ctx.log(`judge failed for answer ${answer.id}: ${error instanceof Error ? error.message : error}`);
          }
          done++;
          await ctx.progress({ done, total });
        }),
      ),
    );

    // Competitors named by engines feed share of voice; keep the most frequent few.
    if (discovered.size) {
      await addCompetitors(
        scan.id,
        [...discovered].slice(0, 8).map(name => ({ name, origin: 'engine' as const, source_route: null, domain: null })),
      );
    }
  },
};
