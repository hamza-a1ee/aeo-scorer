export const SCAN_STATUSES = [
  'queued',
  'running',
  'completed',
  'partial',
  'failed',
] as const;
export type TScanStatus = (typeof SCAN_STATUSES)[number];

export const SCAN_STAGES = [
  'crawl',
  'health',
  'facts',
  'questions',
  'engines',
  'judge',
  'report',
] as const;
export type TScanStage = (typeof SCAN_STAGES)[number];

export const STAGE_STATUSES = [
  'pending',
  'running',
  'done',
  'failed',
  'skipped',
] as const;
export type TStageStatus = (typeof STAGE_STATUSES)[number];

export const PAGE_TYPES = [
  'home',
  'pricing',
  'product',
  'features',
  'compare',
  'docs',
  'faq',
  'blog',
  'about',
  'integrations',
  'security',
  'other',
] as const;
export type TPageType = (typeof PAGE_TYPES)[number];
