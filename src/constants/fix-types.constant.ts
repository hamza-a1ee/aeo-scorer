import type { TEffort, TFixType, TSubScore } from '@/types/enums/fix.enum';

export interface IFixTypeMeta {
  type: TFixType;
  shortTitle: string;
  effort: TEffort;
  subScores: TSubScore[];
  placement: string | null;
  /** true when copy is drafted by the LLM; false when it is a code template only. */
  drafted: boolean;
}

export const FIX_TYPE_META: Record<TFixType, IFixTypeMeta> = {
  robots_patch: { type: 'robots_patch', shortTitle: 'robots.txt patch', effort: 'minutes', subScores: ['site_health'], placement: 'Site root', drafted: false },
  definitional_paragraph: { type: 'definitional_paragraph', shortTitle: 'Definitional paragraph', effort: 'minutes', subScores: ['visibility', 'content_readiness'], placement: 'Above the fold', drafted: true },
  product_jsonld: { type: 'product_jsonld', shortTitle: 'Product + Offer JSON-LD', effort: 'minutes', subScores: ['site_health', 'accuracy'], placement: 'In <head>', drafted: false },
  llms_txt: { type: 'llms_txt', shortTitle: 'llms.txt', effort: 'minutes', subScores: ['site_health', 'content_readiness'], placement: 'Site root', drafted: false },
  feature_summary: { type: 'feature_summary', shortTitle: 'Feature summary', effort: 'hours', subScores: ['visibility', 'accuracy'], placement: 'Top of page', drafted: true },
  rating_fix: { type: 'rating_fix', shortTitle: 'Rating fixes', effort: 'hours', subScores: ['reputation'], placement: 'Reviews section', drafted: true },
  freshness_note: { type: 'freshness_note', shortTitle: 'Freshness note', effort: 'minutes', subScores: ['site_health'], placement: 'Below the title', drafted: false },
  directory_checklist: { type: 'directory_checklist', shortTitle: 'Directory checklist', effort: 'days', subScores: ['visibility', 'reputation'], placement: null, drafted: true },
};

export const EFFORT_FACTOR: Record<TEffort, number> = { minutes: 1, hours: 2, days: 4 };
export const MAX_FIXES = 8;
export const TOP_FIXES = 3;
