export const INTENTS = [
  'category',
  'definition',
  'feature',
  'comparison',
  'task',
  'reputation',
] as const;
export type TIntent = (typeof INTENTS)[number];

export const ENGINES = ['gemini', 'chatgpt', 'perplexity'] as const;
export type TEngine = (typeof ENGINES)[number];

export const ANSWER_STATUSES = ['ok', 'failed', 'skipped'] as const;
export type TAnswerStatus = (typeof ANSWER_STATUSES)[number];

export const POSITIONS = ['first', 'listed', 'absent'] as const;
export type TPosition = (typeof POSITIONS)[number];

export const SENTIMENTS = ['positive', 'neutral', 'negative', 'na'] as const;
export type TSentiment = (typeof SENTIMENTS)[number];

export const CLAIM_KINDS = ['pricing', 'feature', 'platform', 'other'] as const;
export type TClaimKind = (typeof CLAIM_KINDS)[number];

export const VERDICTS = ['correct', 'wrong', 'unverifiable'] as const;
export type TVerdict = (typeof VERDICTS)[number];

export const SOURCE_CLASSES = [
  'your_site',
  'competitor_sites',
  'reddit_forums',
  'review_sites',
  'roundups',
  'other',
] as const;
export type TSourceClass = (typeof SOURCE_CLASSES)[number];
