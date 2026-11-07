import 'server-only';

import { AI_BOTS } from '@/constants/bots.constant';
import { ENGINE_LABELS } from '@/constants/engines.constant';
import { EFFORT_FACTOR, FIX_TYPE_META } from '@/constants/fix-types.constant';
import { RATING_LABELS } from '@/constants/ratings.constant';
import { STALE_DAYS } from '@/constants/scoring-weights.constant';
import type { TAnswerRow, TJudgmentRow, TQuestionRow } from '@/lib/supabase/rows.type';
import { findBlockingLine } from '@/server/crawler/robots.util';
import type { IScanData } from '@/server/scoring/score-input.util';
import { type IScoreInput, type IScoreResult, computeScore } from '@/server/scoring/score.util';
import type { TFixType } from '@/types/enums/fix.enum';
import type { TRatingPlatform } from '@/types/enums/fact.enum';
import { formatMonthYear } from '@/utils/format.util';

export interface IFixCandidate {
  type: TFixType;
  route: string;
  title: string;
  /** One line under the title in "Top fixes". */
  why: string;
  /** Short gap in the "All fixes" table. */
  gap: string;
  gapQuestionId: number | null;
  /** Fact key or label the draft centres on (feature summary). */
  focus: string | null;
  apply(input: IScoreInput): IScoreInput;
}

export interface IRankedFix extends IFixCandidate {
  lift: number;
  rank: number;
  isTop3: boolean;
}

const BOT_PRODUCT: Record<string, string> = {
  GPTBot: 'ChatGPT search',
  ClaudeBot: 'Claude',
  PerplexityBot: 'Perplexity',
  'Google-Extended': 'Gemini',
  Bingbot: 'Bing and Copilot',
  CCBot: 'Common Crawl',
};

const listJoin = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
const trimTo = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const freshPts = (days: number | null | undefined) =>
  days === null || days === undefined ? 5 : days <= 90 ? 15 : days <= 365 ? 8 : 0;

interface IJoined {
  q: TQuestionRow;
  a: TAnswerRow;
  j: TJudgmentRow;
}

function joinJudged(data: IScanData): IJoined[] {
  const q = new Map(data.questions.map(x => [x.id, x]));
  const a = new Map(data.answers.map(x => [x.id, x]));
  return data.judgments.flatMap(j => {
    const answer = a.get(j.answer_id);
    const question = answer ? q.get(answer.question_id) : undefined;
    return answer && question ? [{ q: question, a: answer, j }] : [];
  });
}

function mostCommon(xs: string[]): string | null {
  const counts = new Map<string, number>();
  xs.forEach(x => counts.set(x, (counts.get(x) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** Fact key a feature-summary fix on this route is about. */
export function focusForRoute(data: IScanData, route: string): string | null {
  const keys = data.claims
    .filter(c => c.verdict === 'wrong' && c.kind === 'feature' && c.fact_key)
    .map(c => c.fact_key!);
  const onRoute = data.facts.find(f => keys.includes(f.key) && f.source_route === route);
  return onRoute?.label ?? null;
}

/** Deterministic triggers: every fix here maps to a measured gap. */
export function selectFixCandidates(data: IScanData, input: IScoreInput, score: IScoreResult): IFixCandidate[] {
  const out: IFixCandidate[] = [];
  const brand = input.brand;
  const rows = joinJudged(data);
  const intentOf = new Map(input.questions.map(q => [q.id, q.intent]));
  const healthByRoute = new Map(
    data.health.map(h => [data.pages.find(p => p.id === h.page_id)?.route ?? '', h]),
  );

  // 1. robots.txt
  const blocked = Object.entries(data.site?.site_bot_access ?? {})
    .filter(([, v]) => v === 'blocked')
    .map(([k]) => k);
  if (blocked.length) {
    const line = findBlockingLine(data.site?.robots_txt ?? null, blocked[0]);
    out.push({
      type: 'robots_patch',
      route: '/robots.txt',
      title: `Unblock ${listJoin(blocked)} in robots.txt`,
      why: `${line ? `Line ${line.line}` : 'Your robots.txt'} blocks ${BOT_PRODUCT[blocked[0]] ?? blocked[0]} from reading your pages.${blocked.length > 1 ? ` ${blocked.length} AI bots are blocked in total.` : ''}`,
      gap: `${listJoin(blocked)} blocked on every route`,
      gapQuestionId: null,
      focus: null,
      apply: i => ({
        ...i,
        siteScore: Math.min(100, i.siteScore + (30 * blocked.length) / AI_BOTS.length),
        routes: i.routes.map(r => ({
          ...r,
          routeScore: Math.min(100, r.routeScore + (40 * (AI_BOTS.length - (r.botsAllowed ?? AI_BOTS.length))) / AI_BOTS.length),
          botsAllowed: AI_BOTS.length,
        })),
      }),
    });
  }

  // 2. Definitional paragraph on home
  const defRows = rows.filter(r => r.q.intent === 'definition');
  const defAbsent = defRows.filter(r => r.j.mention_position === 'absent');
  if (!input.content.descriptionOnHome || defAbsent.length) {
    const ex =
      defRows.find(r => r.j.cited_our_pages.length && !r.j.cited_our_pages.includes('/')) ??
      defAbsent[0] ??
      defRows[0];
    const cited = ex?.j.cited_our_pages.find(p => p !== '/');
    out.push({
      type: 'definitional_paragraph',
      route: '/',
      title: `Add a “What is ${brand}?” paragraph to the home page`,
      why: `No plain definition above the fold.${cited ? ` ${ENGINE_LABELS[ex!.a.engine]} described you from ${cited} instead.` : ex && ex.j.mention_position === 'absent' ? ` ${ENGINE_LABELS[ex.a.engine]} could not say what ${brand} is.` : ''}`,
      gap: 'No plain “what is” answer on home',
      gapQuestionId: ex?.q.id ?? null,
      focus: null,
      apply: i => ({
        ...i,
        content: { ...i.content, descriptionOnHome: true },
        judged: i.judged.map(j =>
          intentOf.get(j.questionId) === 'definition' && j.position === 'absent'
            ? { ...j, position: 'first', mentioned: true }
            : j,
        ),
      }),
    });
  }

  // 3. Product + Offer JSON-LD on pricing (or home)
  const pricing = data.pages.find(p => p.page_type === 'pricing' && !p.fetch_error);
  const jsonldRoute = pricing?.route ?? '/';
  const jsonldHealth = healthByRoute.get(jsonldRoute);
  if (jsonldHealth && jsonldHealth.expected_schema_ok !== true) {
    const wrongPricing = data.claims.filter(c => c.kind === 'pricing' && c.verdict === 'wrong').length;
    out.push({
      type: 'product_jsonld',
      route: jsonldRoute,
      title: `Add Product and Offer JSON-LD to ${jsonldRoute}`,
      why: `${jsonldRoute} has no machine-readable prices, so engines guess them from text.${wrongPricing ? ` ${wrongPricing} answer${wrongPricing === 1 ? '' : 's'} got your price wrong.` : ''}`,
      gap: 'Pricing has no machine-readable prices',
      gapQuestionId: null,
      focus: null,
      apply: i => {
        let flip = 0;
        return {
          ...i,
          routes: i.routes.map(r =>
            r.route === jsonldRoute
              ? { ...r, routeScore: Math.min(100, r.routeScore + (20 - (r.schemaPoints ?? 0))), schemaPoints: 20 }
              : r,
          ),
          // Assume half of the wrong price claims get fixed by structured prices.
          claims: i.claims.map(c =>
            c.kind === 'pricing' && c.verdict === 'wrong' && flip++ % 2 === 0 ? { ...c, verdict: 'correct' } : c,
          ),
        };
      },
    });
  }

  // 4. llms.txt
  if (data.site && !data.site.llms_txt_found) {
    out.push({
      type: 'llms_txt',
      route: '/llms.txt',
      title: 'Publish an llms.txt file',
      why: 'No /llms.txt at the site root. It hands engines a plain summary and your key pages.',
      gap: 'File missing at site root',
      gapQuestionId: null,
      focus: null,
      apply: i => ({ ...i, siteScore: Math.min(100, i.siteScore + 40) }),
    });
  }

  // 5. Feature summary
  const wrongFeature = data.claims.filter(c => c.verdict === 'wrong' && c.kind === 'feature');
  const featuresPage = data.pages.find(p => (p.page_type === 'features' || p.page_type === 'product') && !p.fetch_error);
  if (wrongFeature.length) {
    const key = mostCommon(wrongFeature.map(c => c.fact_key ?? '').filter(Boolean));
    const fact = data.facts.find(f => f.key === key);
    const claim = wrongFeature.find(c => c.fact_key === key) ?? wrongFeature[0];
    const ex = rows.find(r => r.j.id === claim.judgment_id);
    const route = fact?.source_route ?? featuresPage?.route ?? '/';
    out.push({
      type: 'feature_summary',
      route,
      title: `Correct what engines say about ${fact?.label ?? 'your features'}`,
      why: `${ENGINE_LABELS[claim.engine]} said “${trimTo(claim.text, 90)}”${fact?.value ? ` Your site says: ${trimTo(fact.value, 80)}.` : ''}`,
      gap: `${ENGINE_LABELS[claim.engine]} said: “${trimTo(claim.text, 70)}”`,
      gapQuestionId: ex?.q.id ?? null,
      focus: fact?.label ?? null,
      apply: i => ({
        ...i,
        claims: i.claims.map(c =>
          c.kind === 'feature' && c.verdict === 'wrong' && (!key || c.factKey === key) ? { ...c, verdict: 'correct' } : c,
        ),
      }),
    });
  } else {
    const absent = rows.filter(r => (r.q.intent === 'feature' || r.q.intent === 'task') && r.j.mention_position === 'absent');
    if (absent.length >= 2) {
      const should = mostCommon(absent.map(r => r.j.should_cite_route ?? '').filter(r => r.startsWith('/')));
      const route = should ?? featuresPage?.route ?? '/features';
      const wc = data.pages.find(p => p.route === route)?.word_count;
      out.push({
        type: 'feature_summary',
        route,
        title: `Publish a plain feature summary on ${route}`,
        why: `Absent from ${absent.length} feature and task questions.${wc ? ` Your ${route} page is ${wc} words long.` : ''}`,
        gap: `Absent from ${absent.length} feature and task questions`,
        gapQuestionId: absent[0].q.id,
        focus: null,
        apply: i => ({
          ...i,
          judged: i.judged.map(j => {
            const intent = intentOf.get(j.questionId);
            return (intent === 'feature' || intent === 'task') && j.position === 'absent' && (j.shouldCite ?? route) === route
              ? { ...j, position: 'listed', mentioned: true }
              : j;
          }),
        }),
      });
    }
  }

  // 6. Ratings quoted wrong
  const wrongRatings = score.ratingChecks.filter(c => c.verdict === 'wrong');
  if (wrongRatings.length) {
    const label = (p: string) => RATING_LABELS[p as TRatingPlatform] ?? p;
    const first = wrongRatings[0];
    const route =
      data.pages.find(p => /review|testimonial|customers|wall-of-love/i.test(p.route) && !p.fetch_error)?.route ?? '/';
    const platforms = new Set(wrongRatings.map(r => r.platform));
    out.push({
      type: 'rating_fix',
      route,
      title: `Show your real ${listJoin(wrongRatings.map(r => label(r.platform)))} rating${wrongRatings.length > 1 ? 's' : ''} on ${route}`,
      why: `Engines quote your ${label(first.platform)} rating as ${first.quoted}; the real rating is ${first.real}.`,
      gap: `${label(first.platform)} rating quoted as ${first.quoted}, real ${first.real}`,
      gapQuestionId: null,
      focus: null,
      apply: i => {
        const real = new Map(i.realRatings.map(r => [r.platform, r.value]));
        return {
          ...i,
          judged: i.judged.map(j => ({
            ...j,
            ratingsQuoted: j.ratingsQuoted.map(r => (platforms.has(r.platform) ? { ...r, value: real.get(r.platform) ?? r.value } : r)),
          })),
        };
      },
    });
  }

  // 7. Freshness on a key page
  const keyTypes = new Set(['home', 'pricing', 'features', 'product']);
  const stale = data.pages
    .filter(p => keyTypes.has(p.page_type) && !p.fetch_error)
    .map(p => ({ p, h: healthByRoute.get(p.route) }))
    .filter(x => x.h && (x.h.freshness_days === null ? x.p.page_type === 'home' || x.p.page_type === 'pricing' : x.h.freshness_days > STALE_DAYS))
    .sort((a, b) => (b.h!.freshness_days ?? -1) - (a.h!.freshness_days ?? -1))[0];
  if (stale) {
    const when = formatMonthYear(stale.h!.last_updated);
    const route = stale.p.route;
    out.push({
      type: 'freshness_note',
      route,
      title: `Add a visible “last updated” date to ${route}`,
      why: when ? `${route} was last updated ${when}. Engines favour pages with a recent date.` : `${route} shows no last-updated date, visible or in markup.`,
      gap: when ? `${route} last updated ${when}` : `${route} shows no update date`,
      gapQuestionId: null,
      focus: null,
      apply: i => ({
        ...i,
        routes: i.routes.map(r =>
          r.route === route ? { ...r, routeScore: Math.min(100, r.routeScore + (15 - freshPts(r.freshnessDays))), freshnessDays: 0 } : r,
        ),
      }),
    });
  }

  // 8. Review directories with no listing
  const directories: TRatingPlatform[] = ['g2', 'capterra', 'trustpilot'];
  const missing = directories.filter(p => !data.ratings.some(r => r.platform === p && r.value !== null));
  const reviewCited = rows.some(r => (r.j.source_classes.review_sites ?? 0) + (r.j.source_classes.roundups ?? 0) > 0);
  if (missing.length && (reviewCited || missing.length === directories.length)) {
    const labels = missing.map(p => RATING_LABELS[p]);
    out.push({
      type: 'directory_checklist',
      route: 'external',
      title: `List ${brand} on ${listJoin(labels)}`,
      why: `Engines lean on review sites and roundups for category questions. You have no ${listJoin(labels)} listing.`,
      gap: `No ${listJoin(labels)} listing`,
      gapQuestionId: null,
      focus: null,
      apply: i => {
        let n = 0;
        return {
          ...i,
          // Estimate: one in four absent category answers picks you up from a directory.
          judged: i.judged.map(j =>
            intentOf.get(j.questionId) === 'category' && j.position === 'absent' && n++ % 4 === 0
              ? { ...j, position: 'listed', mentioned: true }
              : j,
          ),
        };
      },
    });
  }

  return out;
}

const partsSum = (s: IScoreResult) => s.visibility + s.accuracy + s.reputation + s.site_health + s.content_readiness;

/** Lift = re-score with the fix applied; rank by lift per unit of effort. */
export function rankFixes(candidates: IFixCandidate[], input: IScoreInput, base: IScoreResult): IRankedFix[] {
  const baseSum = partsSum(base);
  return candidates
    .map(c => ({ ...c, lift: Math.max(0, Math.round((partsSum(computeScore(c.apply(input))) - baseSum) * 10) / 10) }))
    .sort((a, b) => b.lift / EFFORT_FACTOR[FIX_TYPE_META[b.type].effort] - a.lift / EFFORT_FACTOR[FIX_TYPE_META[a.type].effort])
    .map((c, i) => ({ ...c, rank: i + 1, isTop3: i < 3 }));
}
