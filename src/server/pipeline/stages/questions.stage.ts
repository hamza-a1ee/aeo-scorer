import 'server-only';

import { INTENT_DISTRIBUTION, INTENT_WEIGHT, UNBRANDED_INTENTS } from '@/constants/intents.constant';
import { buildQuestionPrompt, QUESTION_GEN_SYSTEM } from '@/lib/ai/prompts/question-gen.prompt';
import { callStructured } from '@/lib/ai/structured.util';
import type { TFactRow } from '@/lib/supabase/rows.type';
import { questionGenSchema } from '@/schema/question-gen.schema';
import { brandAliases, brandLabel, mentionsBrand } from '@/server/judge/brand.util';
import { listCompetitors, listFacts } from '@/server/repositories/fact-sheet.repo';
import { listQuestions, replaceQuestions } from '@/server/repositories/answer.repo';
import { INTENTS, type TIntent } from '@/types/enums/answer.enum';

import type { IPipelineStage } from '../pipeline-context.type';

const fact = (facts: TFactRow[], key: string) => facts.find(f => f.key === key && f.value)?.value ?? null;

/** Templated questions used when the LLM falls short. */
function fallbackQuestions(intent: TIntent, brand: string, facts: TFactRow[], competitors: string[]): string[] {
  const category = (fact(facts, 'category') ?? 'software').toLowerCase();
  const target = fact(facts, 'target_customer')?.toLowerCase() ?? 'small teams';
  const features = facts.filter(f => f.fact_group === 'features' && f.value && f.key.startsWith('feature_')).map(f => f.label.toLowerCase());
  const rival = competitors[0] ?? null;
  switch (intent) {
    case 'category':
      return [`best ${category} for ${target}`, `top ${category} tools in ${new Date().getFullYear()}`, `simple ${category} for ${target}`, `which ${category} should I use`];
    case 'definition':
      return [`what is ${brand}`, `what does ${brand} do`, `who is ${brand} for`];
    case 'feature':
      return [...features.slice(0, 4).map(f => `does ${brand} have ${f}`), `does ${brand} have a free plan`, `what platforms does ${brand} support`];
    case 'comparison':
      return rival ? [`${brand} vs ${rival}`, `${rival} alternatives`, `is ${brand} better than ${rival}`] : [`${brand} alternatives`, `${brand} vs competitors`, `best alternative to ${brand}`];
    case 'task':
      return features.slice(0, 3).map(f => `how to set up ${f} for my business`).concat([`how to choose ${category}`]);
    case 'reputation':
      return [`${brand} reviews`, `is ${brand} worth it`, `${brand} pricing`];
  }
}

/** Stage 4: 20 buyer questions across six intents. */
export const questionsStage: IPipelineStage = {
  key: 'questions',
  async run(ctx) {
    const { scan, env } = ctx;
    const existing = await listQuestions(scan.id);
    const target = Math.min(env.MAX_QUESTIONS, 20);
    if (existing.length >= target) return;

    const [facts, competitorRows] = await Promise.all([listFacts(scan.id), listCompetitors(scan.id)]);
    const brand = brandLabel(scan);
    const aliases = brandAliases(scan, facts);
    const competitors = competitorRows.map(c => c.name);

    let generated: { intent: TIntent; text: string }[] = [];
    try {
      const out = await callStructured(
        questionGenSchema,
        buildQuestionPrompt({
          brand,
          category: fact(facts, 'category'),
          description: fact(facts, 'one_line_description'),
          target: fact(facts, 'target_customer'),
          features: facts.filter(f => f.key.startsWith('feature_') && f.value).map(f => `${f.label}: ${f.value}`),
          competitors,
        }),
        { system: QUESTION_GEN_SYSTEM, temperature: 0.6 },
      );
      generated = out.questions;
    } catch (error) {
      ctx.log(`question generation failed, using templates: ${error instanceof Error ? error.message : error}`);
    }

    const seen = new Set<string>();
    const rows: { intent: TIntent; text: string }[] = [];
    // Scale the distribution down if MAX_QUESTIONS < 20.
    const quota = Object.fromEntries(
      INTENTS.map(i => [i, Math.max(1, Math.round((INTENT_DISTRIBUTION[i] * target) / 20))]),
    ) as Record<TIntent, number>;

    for (const intent of INTENTS) {
      const pool = [
        ...generated.filter(q => q.intent === intent).map(q => q.text),
        ...fallbackQuestions(intent, brand, facts, competitors),
      ];
      for (const raw of pool) {
        if (rows.filter(r => r.intent === intent).length >= quota[intent]) break;
        const text = raw.trim().replace(/\s+/g, ' ').replace(/\?$/, '');
        const key = text.toLowerCase();
        if (!text || seen.has(key)) continue;
        if (UNBRANDED_INTENTS.includes(intent) && mentionsBrand(text, aliases)) continue;
        seen.add(key);
        rows.push({ intent, text });
      }
    }

    await replaceQuestions(
      scan.id,
      rows.slice(0, target).map((r, i) => ({
        intent: r.intent,
        text: r.text,
        weight: INTENT_WEIGHT[r.intent],
        names_brand: mentionsBrand(r.text, aliases),
        sort_order: i,
      })),
    );
    await ctx.progress({ done: rows.length, total: target });
  },
};
