import type { TPosition } from '@/types/enums/answer.enum';
import type { TSubScore } from '@/types/enums/fix.enum';

export const SCORING_MODEL_VERSION = '1.0';

/** 60 points from what engines say, 40 from the site. */
export const SUB_SCORE_MAX: Record<TSubScore, number> = {
  visibility: 25,
  accuracy: 25,
  reputation: 10,
  site_health: 25,
  content_readiness: 15,
};

export const SUB_SCORE_LABELS: Record<TSubScore, { name: string; description: string; question: string; side: 'ENGINES' | 'SITE' }> = {
  visibility: { name: 'Visibility', description: 'mentioned when it should be', question: 'Do engines mention you when a buyer asks about your category?', side: 'ENGINES' },
  accuracy: { name: 'Accuracy', description: 'facts engines get right', question: 'When they describe you, are the prices and features right?', side: 'ENGINES' },
  reputation: { name: 'Reputation', description: 'sentiment and ratings', question: 'What ratings, reviews and tone do they repeat about you?', side: 'ENGINES' },
  site_health: { name: 'Site health', description: 'AI crawlers can read it', question: 'Can GPTBot, ClaudeBot and others reach and read your pages?', side: 'SITE' },
  content_readiness: { name: 'Content readiness', description: 'site states the facts', question: 'Does your site state the facts an engine needs to quote?', side: 'SITE' },
};

export const POSITION_VALUE: Record<TPosition, number> = {
  first: 1,
  listed: 0.6,
  absent: 0,
};

/** Wrong pricing and feature claims cost double. */
export const CLAIM_KIND_WEIGHT = { pricing: 2, feature: 2, platform: 1, other: 1 } as const;
export const MIN_VERIFIABLE_CLAIMS = 3;
export const ACCURACY_FALLBACK = 20;

export const SENTIMENT_VALUE = { positive: 1, neutral: 0.6, negative: 0 } as const;
export const REPUTATION_SENTIMENT_POINTS = 6;
export const REPUTATION_RATING_POINTS = 4;
export const RATING_MATCH_TOLERANCE = 0.2;

/** Home and pricing count 3× in the site-health average. */
export const KEY_PAGE_WEIGHT = 3;
export const SITE_HEALTH_ROUTE_POINTS = 20;
export const SITE_HEALTH_SITE_POINTS = 5;

export const GRADE_THRESHOLDS: [number, string][] = [
  [85, 'A'],
  [70, 'B'],
  [55, 'C'],
  [40, 'D'],
  [0, 'F'],
];

export const STALE_DAYS = 180;
