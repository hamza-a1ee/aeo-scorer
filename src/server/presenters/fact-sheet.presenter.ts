import 'server-only';

import { FACT_GROUP_TITLES } from '@/constants/fact-catalog.constant';
import { RATING_LABELS } from '@/constants/ratings.constant';
import type { TCompetitorRow, TFactRow, TRatingRow, TScanRow } from '@/lib/supabase/rows.type';
import { listCompetitors, listFacts, listRatings } from '@/server/repositories/fact-sheet.repo';
import { countFetchedPages } from '@/server/repositories/page.repo';
import { FACT_GROUPS, RATING_PLATFORMS } from '@/types/enums/fact.enum';
import type { ICompetitor, IFact, IFactSheet, IRating } from '@/types/interfaces/fact-sheet.interface';

export const toFact = (f: TFactRow): IFact => ({
  id: f.id,
  key: f.key,
  group: f.fact_group,
  label: f.label,
  value: f.value,
  status: f.status,
  note: f.note,
  confirmed: f.confirmed,
  sourceRoute: f.source_route,
  sourceQuote: f.source_quote,
  editedByUser: f.edited_by_user,
});

export const toCompetitor = (c: TCompetitorRow): ICompetitor => ({
  id: c.id,
  name: c.name,
  origin: c.origin,
  sourceRoute: c.source_route,
});

export const toRating = (r: TRatingRow): IRating => ({
  platform: r.platform,
  label: RATING_LABELS[r.platform],
  value: r.value === null ? null : Number(r.value),
  count: r.count,
  sourceUrl: r.source_url,
  origin: r.origin,
});

function groupHint(group: (typeof FACT_GROUPS)[number], facts: TFactRow[]): string {
  if (group === 'basics') return 'From home and about';
  if (group === 'pricing') {
    const route = facts.find(f => f.source_route)?.source_route;
    return route ? `From ${route}` : 'From your pricing page';
  }
  const found = facts.filter(f => f.value).length;
  return `${found} of ${facts.length} found`;
}

export async function getFactSheetView(scan: TScanRow): Promise<IFactSheet> {
  const [facts, competitors, ratings, pageCount] = await Promise.all([
    listFacts(scan.id),
    listCompetitors(scan.id),
    listRatings(scan.id),
    countFetchedPages(scan.id),
  ]);
  const ratingBy = new Map(ratings.map(r => [r.platform, r]));
  return {
    scanId: scan.id,
    domain: scan.domain,
    brandName: scan.brand_name,
    status: scan.status,
    version: scan.fact_sheet_version,
    factCount: facts.filter(f => f.value).length,
    pageCount,
    groups: FACT_GROUPS.map(group => {
      const inGroup = facts.filter(f => f.fact_group === group);
      // Empty feature slots are noise; every other missing fact stays visible in red.
      const shown = inGroup.filter(f => !(f.key.startsWith('feature_') && !f.value && !f.edited_by_user));
      return { group, title: FACT_GROUP_TITLES[group], hint: groupHint(group, inGroup), facts: shown.map(toFact) };
    }),
    competitors: competitors.map(toCompetitor),
    ratings: RATING_PLATFORMS.map(
      p =>
        (ratingBy.get(p) && toRating(ratingBy.get(p)!)) ?? {
          platform: p,
          label: RATING_LABELS[p],
          value: null,
          count: null,
          sourceUrl: null,
          origin: null,
        },
    ),
    readOnly: false,
  };
}
