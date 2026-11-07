import 'server-only';

import { FACT_CATALOG } from '@/constants/fact-catalog.constant';
import type {
  TAnswerRow,
  TClaimRow,
  TCompetitorRow,
  TFactRow,
  TJudgmentRow,
  TPageHealthRow,
  TPageRow,
  TQuestionRow,
  TRatingRow,
  TScanRow,
  TSiteHealthRow,
} from '@/lib/supabase/rows.type';
import { brandLabel } from '@/server/judge/brand.util';
import { listAnswers, listClaims, listJudgments, listQuestions } from '@/server/repositories/answer.repo';
import { listCompetitors, listFacts, listRatings } from '@/server/repositories/fact-sheet.repo';
import { getSiteHealth, listPageHealth, listPages } from '@/server/repositories/page.repo';
import { getScan } from '@/server/repositories/scan.repo';

import type { IScoreInput } from './score.util';

/** Every row the report and fixes need for one scan. */
export interface IScanData {
  scan: TScanRow;
  pages: TPageRow[];
  health: TPageHealthRow[];
  site: TSiteHealthRow | null;
  facts: TFactRow[];
  competitors: TCompetitorRow[];
  ratings: TRatingRow[];
  questions: TQuestionRow[];
  answers: TAnswerRow[];
  judgments: TJudgmentRow[];
  claims: TClaimRow[];
}

export async function loadScanData(scanId: string): Promise<IScanData> {
  const scan = await getScan(scanId);
  if (!scan) throw new Error(`Scan ${scanId} not found`);
  const [pages, health, site, facts, competitors, ratings, questions, answers, judgments, claims] =
    await Promise.all([
      listPages(scanId),
      listPageHealth(scanId),
      getSiteHealth(scanId),
      listFacts(scanId),
      listCompetitors(scanId),
      listRatings(scanId),
      listQuestions(scanId),
      listAnswers(scanId),
      listJudgments(scanId),
      listClaims(scanId),
    ]);
  return { scan, pages, health, site, facts, competitors, ratings, questions, answers, judgments, claims };
}

const CURRENCY_PRICE = /([$€£¥₹]\s?\d)|(\b\d+(?:[.,]\d+)?\s?(?:USD|EUR|GBP|CAD|AUD|INR|PKR)\b)/i;

export const factValue = (data: IScanData, key: string) => {
  const f = data.facts.find(x => x.key === key);
  return f?.confirmed && f.value ? f.value : null;
};

export function pageOf(data: IScanData, type: TPageRow['page_type']) {
  return data.pages.find(p => p.page_type === type && !p.fetch_error) ?? null;
}

export function contentSignals(data: IScanData): IScoreInput['content'] {
  const brand = brandLabel(data.scan);
  const home = pageOf(data, 'home') ?? data.pages.find(p => p.route === '/') ?? null;
  const homeText = `${home?.main_text ?? ''} ${home?.text_content ?? ''}`;
  const desc = data.facts.find(f => f.key === 'one_line_description');
  const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const descriptionOnHome =
    (!!desc?.confirmed && desc.source_route === '/' && desc.quote_verified) ||
    new RegExp(`\\b${esc}\\s+(is|are)\\s+(a|an|the)\\b`, 'i').test(homeText);

  const pricing = data.pages.filter(p => p.page_type === 'pricing' && !p.fetch_error);
  const numericPriceOnPricing = pricing.some(p => CURRENCY_PRICE.test(p.main_text ?? p.text_content ?? ''));
  const hasComparePage = data.pages.some(p => p.page_type === 'compare' && !p.fetch_error);
  const hasFaq =
    data.pages.some(p => p.page_type === 'faq' && !p.fetch_error) ||
    data.health.some(h => h.schema_types.includes('FAQPage'));
  return { descriptionOnHome, numericPriceOnPricing, hasComparePage, hasFaq };
}

/** Schema points a route earned (0, 10 or 20), mirroring scoreRoute. */
function schemaPoints(h: TPageHealthRow) {
  let pts = h.schema_types.length ? 10 : 0;
  if (h.expected_schema_ok === true || (h.expected_schema_ok === null && h.schema_types.length)) pts += 10;
  return pts;
}

export function buildScoreInput(data: IScanData): IScoreInput {
  const answerById = new Map(data.answers.map(a => [a.id, a]));
  const pageById = new Map(data.pages.map(p => [p.id, p]));
  const judged: IScoreInput['judged'] = [];
  for (const j of data.judgments) {
    const a = answerById.get(j.answer_id);
    if (!a || a.status !== 'ok') continue;
    judged.push({
      questionId: a.question_id,
      engine: a.engine,
      position: j.mention_position,
      sentiment: j.sentiment,
      ratingsQuoted: j.ratings_quoted.map(r => ({ platform: r.platform, value: r.value })),
      competitorsMentioned: j.competitors_mentioned,
      mentioned: j.mentioned,
      shouldCite: j.should_cite_route,
    });
  }
  const engines = data.scan.engines.filter(e => judged.some(j => j.engine === e));

  return {
    engines,
    questions: data.questions.map(q => ({ id: q.id, intent: q.intent, weight: q.weight })),
    judged,
    claims: data.claims.map(c => ({ engine: c.engine, kind: c.kind, verdict: c.verdict, factKey: c.fact_key })),
    realRatings: data.ratings.filter(r => r.value !== null).map(r => ({ platform: r.platform, value: Number(r.value) })),
    routes: data.health
      .filter(h => h.route_score !== null)
      .map(h => {
        const page = pageById.get(h.page_id);
        return {
          pageType: page?.page_type ?? 'other',
          route: page?.route,
          routeScore: Number(h.route_score),
          botsAllowed: h.bots_allowed,
          schemaPoints: schemaPoints(h),
          freshnessDays: h.freshness_days,
        };
      }),
    siteScore: Number(data.site?.site_score ?? 0),
    factsConfirmed: data.facts.filter(f => f.confirmed && f.value).length,
    factsTotal: FACT_CATALOG.length,
    content: contentSignals(data),
    brand: brandLabel(data.scan),
    competitors: data.competitors.map(c => c.name),
  };
}
