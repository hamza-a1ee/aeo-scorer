export const FACT_GROUPS = ['basics', 'pricing', 'features'] as const;
export type TFactGroup = (typeof FACT_GROUPS)[number];

export const FACT_STATUSES = ['ok', 'ambiguous', 'missing'] as const;
export type TFactStatus = (typeof FACT_STATUSES)[number];

export const ENTITY_ORIGINS = ['site', 'engine', 'user'] as const;
export type TEntityOrigin = (typeof ENTITY_ORIGINS)[number];

export const RATING_PLATFORMS = [
  'g2',
  'capterra',
  'app_store',
  'google_play',
  'trustpilot',
] as const;
export type TRatingPlatform = (typeof RATING_PLATFORMS)[number];
