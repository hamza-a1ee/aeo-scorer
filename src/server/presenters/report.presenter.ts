import 'server-only';

import { AI_BOTS } from '@/constants/bots.constant';
import { ENGINE_LABELS } from '@/constants/engines.constant';
import { RATING_LABELS } from '@/constants/ratings.constant';
import { STALE_DAYS, SUB_SCORE_LABELS, SUB_SCORE_MAX } from '@/constants/scoring-weights.constant';
import type { TFixRow, TScoreRow } from '@/lib/supabase/rows.type';
import { findBlockingLine } from '@/server/crawler/robots.util';
import { ISSUE_LABELS } from '@/server/health/route-health.util';
import { brandLabel } from '@/server/judge/brand.util';
import type { IScanData } from '@/server/scoring/score-input.util';
import { SOURCE_CLASSES, type TEngine, type TPosition, type TSourceClass } from '@/types/enums/answer.enum';
import { RATING_PLATFORMS, type TRatingPlatform } from '@/types/enums/fact.enum';
import { SUB_SCORES } from '@/types/enums/fix.enum';
import type {
  ICitedPage,
  IEngineCitation,
  IGapRow,
  IRatingCheck,
  IReport,
  IRouteHealthRow,
  IWrongClaim,
} from '@/types/interfaces/report.interface';
import { formatDateTime, formatMonthYear } from '@/utils/format.util';
import { getEnv } from '@/lib/env';

import { toFixSummary } from './fix.presenter';

const SOURCE_LABELS: Record<TSourceClass, string> = {
  your_site: 'Your site',
  competitor_sites: 'Competitor sites',
  reddit_forums: 'Reddit and forums',
  review_sites: 'Review sites (G2, Capterra)',
  roundups: 'Roundups and directories',
  other: 'Other',
};

const TYPE_LABELS: Record<string, string> = { features: 'feature', compare: 'comparison' };
const POS_RANK: Record<TPosition, number> = { absent: 0, listed: 1, first: 2 };

const listJoin = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function topCounts(xs: string[], n: number): string[] {
  const counts = new Map<string, number>();
  for (const x of xs) {
    const k = x.trim();
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

function citedByNote(engines: TEngine[], all: TEngine[]): string {
  const labels = engines.map(e => ENGINE_LABELS[e]);
  if (all.length > 1 && engines.length === all.length) return all.length === 3 ? 'Cited by all three' : 'Cited by every engine';
  return labels.length === 1 ? `Cited by ${labels[0]} only` : `Cited by ${listJoin(labels)}`;
}

export function buildReport(token: string, data: IScanData, score: TScoreRow, fixRows: TFixRow[], scoreCount: number): IReport {
  const { scan } = data;
  const brand = brandLabel(scan);
  const engines = scan.engines.filter(e => data.answers.some(a => a.engine === e && a.status === 'ok'));
  const engineLabels = engines.map(e => ENGINE_LABELS[e]);
  const answerById = new Map(data.answers.map(a => [a.id, a]));
  const qById = new Map(data.questions.map(q => [q.id, q]));
  const judged = data.judgments
    .map(j => ({ j, a: answerById.get(j.answer_id)! }))
    .filter(x => x.a && x.a.status === 'ok');
  const fixes = fixRows.map(toFixSummary);

  // ---- Gap report
  const rows: IGapRow[] = data.questions.flatMap(q => {
    const forQ = judged.filter(x => x.a.question_id === q.id);
    if (!forQ.length) return [];
    const positions = engines.flatMap(e => {
      const hit = forQ.find(x => x.a.engine === e);
      return hit ? [{ engine: e, label: ENGINE_LABELS[e], position: hit.j.mention_position }] : [];
    });
    const worstJ = [...forQ].sort((a, b) => POS_RANK[a.j.mention_position] - POS_RANK[b.j.mention_position])[0];
    const should = topCounts(forQ.map(x => x.j.should_cite_route ?? ''), 1)[0] ?? null;
    return [{
      questionId: q.id,
      question: q.text,
      intent: q.intent,
      doubled: q.weight > 1,
      positions,
      worst: worstJ.j.mention_position,
      cited: forQ.flatMap(x => x.j.cited_our_pages)[0] ?? null,
      shouldCite: !should || should === 'none' ? 'No page covers this' : should,
      why: worstJ.j.why ?? '',
    }];
  });
  rows.sort((a, b) => POS_RANK[a.worst] - POS_RANK[b.worst] || Number(b.doubled) - Number(a.doubled));
  const mentioned = judged.filter(x => x.j.mentioned).length;
  const doubledRows = rows.filter(r => r.doubled);
  const doubledAbsent = doubledRows.filter(r => r.worst === 'absent').length;

  // ---- Citations
  const engineCites: IEngineCitation[] = engines.map(e => {
    const mine = judged.filter(x => x.a.engine === e);
    const citing = mine.filter(x => x.j.cited_our_pages.length);
    return {
      engine: e,
      label: ENGINE_LABELS[e],
      rate: pct(citing.length, mine.length),
      cited: citing.length,
      total: mine.length,
      topPage: topCounts(citing.flatMap(x => x.j.cited_our_pages), 1)[0] ?? null,
      isTop: false,
    };
  });
  const best = Math.max(0, ...engineCites.map(e => e.rate));
  // "Cites you most" only means something when there are engines to compare.
  engineCites.forEach(e => (e.isTop = engineCites.length > 1 && best > 0 && e.rate === best));
  engineCites.sort((a, b) => b.rate - a.rate);

  const sources = SOURCE_CLASSES.map(key => ({
    key,
    label: SOURCE_LABELS[key],
    byEngine: Object.fromEntries(
      engines.map(e => {
        const counts = judged.filter(x => x.a.engine === e).map(x => x.j.source_classes);
        const total = counts.reduce((s, c) => s + Object.values(c).reduce((a, b) => a + (b ?? 0), 0), 0);
        return [e, pct(counts.reduce((s, c) => s + (c[key] ?? 0), 0), total)];
      }),
    ) as Partial<Record<TEngine, number>>,
  }));

  const healthByRoute = new Map(data.health.map(h => [data.pages.find(p => p.id === h.page_id)?.route, h]));
  const ownCites = judged.flatMap(x => x.j.cited_our_pages.map(route => ({ route, engine: x.a.engine })));
  const pages: ICitedPage[] = topCounts(ownCites.map(c => c.route), 6).map(route => {
    const by = [...new Set(ownCites.filter(c => c.route === route).map(c => c.engine))];
    const h = healthByRoute.get(route);
    const stale = (h?.freshness_days ?? 0) > STALE_DAYS;
    return {
      route,
      pct: pct(ownCites.filter(c => c.route === route).length, ownCites.length),
      note: stale ? `Last updated ${formatMonthYear(h!.last_updated)}; engines still cite it` : citedByNote(by, engines),
      flagged: stale,
    };
  });

  // ---- Accuracy
  const verdicts = { correct: 0, wrong: 0, unverifiable: 0 };
  data.claims.forEach(c => verdicts[c.verdict]++);
  const seen = new Set<string>();
  const wrong: IWrongClaim[] = data.claims
    .filter(c => c.verdict === 'wrong')
    .filter(c => {
      const k = `${c.fact_key}|${c.text.toLowerCase().slice(0, 60)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => Number(b.kind === 'pricing' || b.kind === 'feature') - Number(a.kind === 'pricing' || a.kind === 'feature'))
    .slice(0, 10)
    .map(c => {
      const j = data.judgments.find(x => x.id === c.judgment_id);
      const a = j ? answerById.get(j.answer_id) : undefined;
      const fact = data.facts.find(f => f.key === c.fact_key);
      return {
        kind: c.kind,
        doubled: c.kind === 'pricing' || c.kind === 'feature',
        said: c.text,
        engineLabel: ENGINE_LABELS[c.engine],
        question: (a && qById.get(a.question_id)?.text) ?? '',
        truth: c.fact_value ?? fact?.value ?? '',
        source: fact?.source_route ?? null,
        correction: c.suggested_correction ?? '',
      };
    });

  // ---- Reputation
  const toned = judged.filter(x => x.j.sentiment !== 'na');
  const sentiment = {
    positive: toned.filter(x => x.j.sentiment === 'positive').length,
    neutral: toned.filter(x => x.j.sentiment === 'neutral').length,
    negative: toned.filter(x => x.j.sentiment === 'negative').length,
    total: toned.length,
  };
  const negThemes = topCounts(judged.flatMap(x => x.j.negative_themes), 3);
  const posThemes = topCounts(judged.flatMap(x => x.j.positive_themes ?? []), 3);
  const storedChecks = (score.breakdown.rating_checks ?? []) as { platform: string; quoted: number | null; real: number | null; verdict: IRatingCheck['verdict'] }[];
  const ratingChecks: IRatingCheck[] = RATING_PLATFORMS.flatMap(p => {
    const c = storedChecks.find(x => x.platform === p);
    const real = data.ratings.find(r => r.platform === p);
    if (!c && !real && p !== 'g2' && p !== 'capterra') return [];
    return [{
      platform: p as TRatingPlatform,
      label: RATING_LABELS[p],
      quoted: c?.quoted !== null && c?.quoted !== undefined ? String(c.quoted) : null,
      real: real?.value !== null && real?.value !== undefined ? String(Number(real.value)) : 'no listing',
      verdict: c?.verdict ?? 'missing',
    }];
  });

  // ---- Site health
  const site = data.site;
  const robotsLine = (bot: string) => findBlockingLine(site?.robots_txt ?? null, bot);
  const blockedBots = AI_BOTS.filter(b => site?.site_bot_access[b] === 'blocked');
  const routes: IRouteHealthRow[] = data.pages
    .filter(p => !p.fetch_error)
    .flatMap(p => {
      const h = data.health.find(x => x.page_id === p.id);
      if (!h) return [];
      const when = formatMonthYear(h.last_updated);
      return [{
        route: p.route,
        type: TYPE_LABELS[p.page_type] ?? p.page_type,
        access: `${h.bots_allowed} of ${AI_BOTS.length} bots`,
        accessOk: h.bots_allowed === AI_BOTS.length,
        readable: h.readable_without_js,
        schema: h.schema_types.join(', ') || 'none',
        lastUpdated: when,
        stale: (h.freshness_days ?? 0) > STALE_DAYS || (!when && ['home', 'pricing'].includes(p.page_type)),
        issueCount: h.issues.length,
        issues: h.issues.map(i => {
          const line = i.code === 'BOTS_BLOCKED' && blockedBots[0] ? robotsLine(blockedBots[0]) : null;
          return {
            code: i.code,
            label: line ? `robots.txt:${line.line}` : (ISSUE_LABELS[i.code] ?? i.code.toLowerCase()),
            detail: line ? `${line.text} · ${i.detail}` : i.detail,
          };
        }),
      }];
    })
    .sort((a, b) => {
      const key = (r: IRouteHealthRow) => (r.type === 'home' ? 0 : r.type === 'pricing' ? 1 : 2);
      return key(a) - key(b) || b.issueCount - a.issueCount;
    });

  // ---- Run details
  const env = getEnv();
  const intents = new Set(data.questions.map(q => q.intent)).size;
  const runDetails = [
    { label: 'Engines', value: engineLabels.join(', ') || 'none' },
    { label: 'Questions', value: `${data.questions.length} · ${intents} intents` },
    { label: 'Routes crawled', value: `${data.pages.filter(p => !p.fetch_error).length} of ${env.MAX_PAGES} cap` },
    { label: 'Passes', value: '1 · snapshot' },
    { label: 'Scoring model', value: `v${scan.model_version}` },
    { label: 'Finished', value: formatDateTime(scan.completed_at ?? score.computed_at) },
    ...(scoreCount > 1 ? [{ label: 'Re-judged', value: `${scoreCount - 1}× · fact sheet v${score.fact_sheet_version}` }] : []),
    ...score.notes.map(n => ({ label: 'Note', value: n })),
  ];

  return {
    token,
    domain: scan.domain,
    brandName: brand,
    status: scan.status,
    finishedAt: scan.completed_at,
    modelVersion: scan.model_version,
    engines,
    score: {
      total: Math.round(Number(score.total)),
      grade: score.grade,
      isPartial: scan.status === 'partial',
      passes: 1,
      subScores: SUB_SCORES.map(key => ({
        key,
        name: SUB_SCORE_LABELS[key].name,
        description: SUB_SCORE_LABELS[key].description,
        value: Math.round(Number(score[key])),
        max: SUB_SCORE_MAX[key],
      })),
      byEngine: engines
        .filter(e => score.by_engine[e] !== undefined)
        .map(e => ({ engine: e, label: ENGINE_LABELS[e], total: Math.round(score.by_engine[e]!) })),
    },
    topFixes: fixes.filter(f => f.isTop3),
    gaps: {
      summary: `Mentioned in ${mentioned} of ${judged.length} answers.${doubledRows.length ? ` Absent from ${doubledAbsent} of ${doubledRows.length} category and task questions, which count double.` : ''}`,
      rows,
    },
    citations: { engines: engineCites, sources, pages },
    accuracy: {
      summary: `${data.claims.length} claims about ${brand}: ${verdicts.correct} correct, ${verdicts.wrong} wrong, ${verdicts.unverifiable} unverifiable. Wrong pricing and feature claims cost double.`,
      wrong,
    },
    reputation: {
      title: `Reputation, as ${listJoin(engineLabels) || 'engines'} tell${engineLabels.length === 1 ? 's' : ''} it`,
      sentiment,
      negativeLine: negThemes[0] ?? null,
      ratings: ratingChecks,
      themes: [
        ...posThemes.map(text => ({ text, tone: 'positive' as const })),
        ...negThemes.map(text => ({ text, tone: 'negative' as const })),
      ],
      reviewSources: topCounts(judged.flatMap(x => x.j.review_sources), 6),
    },
    siteHealth: {
      summary: `${routes.length} routes crawled. Home and pricing count 3× in the average.`,
      bots: AI_BOTS.map(name => ({ name, allowed: site?.site_bot_access[name] !== 'blocked' })),
      routes,
    },
    shareOfVoice: {
      summary: `Share of all app mentions across the ${judged.length} answers · ${engineLabels.join(', ')}`,
      items: score.share_of_voice.map(s => ({ name: s.name, pct: s.pct, isUs: s.is_us })),
    },
    fixes,
    runDetails,
  };
}
