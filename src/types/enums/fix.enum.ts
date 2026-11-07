export const EFFORTS = ['minutes', 'hours', 'days'] as const;
export type TEffort = (typeof EFFORTS)[number];

export const SUB_SCORES = [
  'visibility',
  'accuracy',
  'reputation',
  'site_health',
  'content_readiness',
] as const;
export type TSubScore = (typeof SUB_SCORES)[number];

export const FIX_TYPES = [
  'robots_patch',
  'definitional_paragraph',
  'product_jsonld',
  'llms_txt',
  'feature_summary',
  'rating_fix',
  'freshness_note',
  'directory_checklist',
] as const;
export type TFixType = (typeof FIX_TYPES)[number];
