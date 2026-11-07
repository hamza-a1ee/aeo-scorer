import {
  ACCURACY_FALLBACK,
  CLAIM_KIND_WEIGHT,
  GRADE_THRESHOLDS,
  KEY_PAGE_WEIGHT,
  MIN_VERIFIABLE_CLAIMS,
  POSITION_VALUE,
  RATING_MATCH_TOLERANCE,
  REPUTATION_RATING_POINTS,
  REPUTATION_SENTIMENT_POINTS,
  SENTIMENT_VALUE,
  SITE_HEALTH_ROUTE_POINTS,
  SITE_HEALTH_SITE_POINTS,
  SUB_SCORE_MAX,
} from '@/constants/scoring-weights.constant';
import type { TClaimKind, TEngine, TIntent, TPosition, TSentiment, TVerdict } from '@/types/enums/answer.enum';
import type { TPageType } from '@/types/enums/scan.enum';

/** Everything the score needs, already loaded. Pure data so fixes can be simulated. */
export interface IScoreInput {
  engines: TEngine[];
  questions: { id: number; intent: TIntent; weight: number }[];
  judged: {
    questionId: number;
    engine: TEngine;
    position: TPosition;
    sentiment: TSentiment;
    ratingsQuoted: { platform: string; value: number | null }[];
    competitorsMentioned: string[];
    mentioned: boolean;
    shouldCite?: string | null;
  }[];
  claims: { engine: TEngine; kind: TClaimKind; verdict: TVerdict; factKey?: string | null }[];
  realRatings: { platform: string; value: number | null }[];
  routes: { pageType: TPageType; routeScore: number; route?: string; botsAllowed?: number; schemaPoints?: number; freshnessDays?: number | null }[];
  siteScore: number;
  factsConfirmed: number;
  factsTotal: number;
  content: {
    descriptionOnHome: boolean;
    numericPriceOnPricing: boolean;
    hasComparePage: boolean;
    hasFaq: boolean;
  };
  brand: string;
  competitors: string[];
}

export interface IScoreResult {
  total: number;
  grade: string;
  visibility: number;
  accuracy: number;
  reputation: number;
  site_health: number;
  content_readiness: number;
  byEngine: Partial<Record<TEngine, number>>;
  shareOfVoice: { name: string; mentions: number; pct: number; is_us: boolean }[];
  ratingChecks: { platform: string; quoted: number | null; real: number | null; verdict: 'matches' | 'wrong' | 'missing' }[];
  breakdown: Record<string, number | string | null>;
  notes: string[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};

export function gradeFor(total: number): string {
  return GRADE_THRESHOLDS.find(([min]) => total >= min)?.[1] ?? 'F';
}

function visibilityFor(input: IScoreInput, engine: TEngine): number | null {
  const weight = new Map(input.questions.map(q => [q.id, q.weight]));
  const rows = input.judged.filter(j => j.engine === engine);
  if (!rows.length) return null;
  let num = 0;
  let den = 0;
  for (const j of rows) {
    const w = weight.get(j.questionId) ?? 1;
    num += w * POSITION_VALUE[j.position];
    den += w;
  }
  return den ? (num / den) * SUB_SCORE_MAX.visibility : null;
}

function accuracyFor(claims: IScoreInput['claims']): { value: number; verifiable: number; enough: boolean } {
  const verifiable = claims.filter(c => c.verdict !== 'unverifiable');
  if (verifiable.length < MIN_VERIFIABLE_CLAIMS) {
    return { value: ACCURACY_FALLBACK, verifiable: verifiable.length, enough: false };
  }
  let wrong = 0;
  let all = 0;
  for (const c of verifiable) {
    const w = CLAIM_KIND_WEIGHT[c.kind];
    all += w;
    if (c.verdict === 'wrong') wrong += w;
  }
  return { value: (1 - wrong / all) * SUB_SCORE_MAX.accuracy, verifiable: verifiable.length, enough: true };
}

function ratingChecks(input: IScoreInput, judged: IScoreInput['judged']) {
  const quotedBy = new Map<string, number[]>();
  for (const j of judged) {
    for (const r of j.ratingsQuoted) {
      if (r.value === null) continue;
      quotedBy.set(r.platform, [...(quotedBy.get(r.platform) ?? []), r.value]);
    }
  }
  const real = new Map(input.realRatings.map(r => [r.platform, r.value]));
  const platforms = new Set([...quotedBy.keys(), ...input.realRatings.filter(r => r.value !== null).map(r => r.platform)]);
  return [...platforms].map(platform => {
    const quoted = median(quotedBy.get(platform) ?? []);
    const realValue = real.get(platform) ?? null;
    let verdict: 'matches' | 'wrong' | 'missing';
    if (quoted === null || realValue === null) verdict = 'missing';
    else verdict = Math.abs(quoted - realValue) <= RATING_MATCH_TOLERANCE ? 'matches' : 'wrong';
    return { platform, quoted, real: realValue, verdict };
  });
}

function reputationFor(input: IScoreInput, judged: IScoreInput['judged']) {
  const toned = judged.filter(j => j.sentiment !== 'na');
  const sentiment = toned.length
    ? (toned.reduce((s, j) => s + SENTIMENT_VALUE[j.sentiment as keyof typeof SENTIMENT_VALUE], 0) / toned.length) * REPUTATION_SENTIMENT_POINTS
    : SENTIMENT_VALUE.neutral * REPUTATION_SENTIMENT_POINTS;
  const checks = ratingChecks(input, judged).filter(c => c.quoted !== null);
  const ratingPts = checks.length
    ? (checks.reduce((s, c) => s + (c.verdict === 'matches' ? 1 : c.verdict === 'missing' ? 0.5 : 0), 0) / checks.length) * REPUTATION_RATING_POINTS
    : REPUTATION_RATING_POINTS / 2;
  return { value: sentiment + ratingPts, toned: toned.length, quotedPlatforms: checks.length };
}

/** Site health sub-score (of 25) from route scores and the site score. */
export function siteHealthPoints(routes: IScoreInput['routes'], siteScore: number) {
  return siteHealthFor({ routes, siteScore } as IScoreInput).value;
}

function siteHealthFor(input: Pick<IScoreInput, 'routes' | 'siteScore'>) {
  let num = 0;
  let den = 0;
  for (const r of input.routes) {
    const w = r.pageType === 'home' || r.pageType === 'pricing' ? KEY_PAGE_WEIGHT : 1;
    num += w * r.routeScore;
    den += w;
  }
  const routeAvg = den ? num / den : 0;
  return {
    value: SITE_HEALTH_ROUTE_POINTS * (routeAvg / 100) + SITE_HEALTH_SITE_POINTS * (input.siteScore / 100),
    routeAvg,
  };
}

function contentFor(input: IScoreInput) {
  const facts = input.factsTotal ? (input.factsConfirmed / input.factsTotal) * 6 : 0;
  return (
    facts +
    (input.content.descriptionOnHome ? 3 : 0) +
    (input.content.numericPriceOnPricing ? 3 : 0) +
    (input.content.hasComparePage ? 1.5 : 0) +
    (input.content.hasFaq ? 1.5 : 0)
  );
}

function shareOfVoice(input: IScoreInput) {
  const counts = new Map<string, number>();
  const canonical = new Map(input.competitors.map(c => [c.toLowerCase(), c]));
  let us = 0;
  for (const j of input.judged) {
    if (j.mentioned) us++;
    for (const name of new Set(j.competitorsMentioned.map(n => n.trim()).filter(Boolean))) {
      const key = canonical.get(name.toLowerCase()) ?? name;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const others = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const all = us + others.reduce((s, [, n]) => s + n, 0);
  return [{ name: input.brand, mentions: us, is_us: true }, ...others.map(([name, mentions]) => ({ name, mentions, is_us: false }))]
    .map(x => ({ ...x, pct: all ? Math.round((x.mentions / all) * 100) : 0 }))
    .sort((a, b) => b.mentions - a.mentions);
}

/** Scoring model v1.0. */
export function computeScore(input: IScoreInput): IScoreResult {
  const notes: string[] = [];
  const engineVis = input.engines.map(e => [e, visibilityFor(input, e)] as const).filter(([, v]) => v !== null) as [TEngine, number][];
  const visibility = engineVis.length ? engineVis.reduce((s, [, v]) => s + v, 0) / engineVis.length : 0;
  if (!engineVis.length) notes.push('Visibility: no judged answers yet.');

  const acc = accuracyFor(input.claims);
  if (!acc.enough) notes.push(`Accuracy: only ${acc.verifiable} verifiable claims, so it is set to ${ACCURACY_FALLBACK}/25 (not enough data).`);

  const rep = reputationFor(input, input.judged);
  const site = siteHealthFor(input);
  const content = contentFor(input);

  const siteParts = site.value + content;
  const byEngine: Partial<Record<TEngine, number>> = {};
  for (const [engine, vis] of engineVis) {
    const engineJudged = input.judged.filter(j => j.engine === engine);
    const engineAcc = accuracyFor(input.claims.filter(c => c.engine === engine));
    const engineRep = reputationFor(input, engineJudged);
    byEngine[engine] = Math.round(vis + engineAcc.value + engineRep.value + siteParts);
  }

  const parts = {
    visibility: r2(visibility),
    accuracy: r2(acc.value),
    reputation: r2(rep.value),
    site_health: r2(site.value),
    content_readiness: r2(content),
  };
  const total = Math.round(Object.values(parts).reduce((a, b) => a + b, 0));

  return {
    ...parts,
    total,
    grade: gradeFor(total),
    byEngine,
    shareOfVoice: shareOfVoice(input),
    ratingChecks: ratingChecks(input, input.judged),
    breakdown: {
      engines_judged: engineVis.length,
      judged_answers: input.judged.length,
      verifiable_claims: acc.verifiable,
      toned_answers: rep.toned,
      quoted_rating_platforms: rep.quotedPlatforms,
      route_average: r2(site.routeAvg),
      site_score: r2(input.siteScore),
      facts_confirmed: input.factsConfirmed,
      facts_total: input.factsTotal,
    },
    notes,
  };
}
