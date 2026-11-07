import type {
  TAnswerStatus,
  TClaimKind,
  TEngine,
  TIntent,
  TPosition,
  TSentiment,
  TSourceClass,
  TVerdict,
} from '@/types/enums/answer.enum';
import type {
  TEntityOrigin,
  TFactGroup,
  TFactStatus,
  TRatingPlatform,
} from '@/types/enums/fact.enum';
import type { TEffort, TFixType, TSubScore } from '@/types/enums/fix.enum';
import type {
  TPageType,
  TScanStage,
  TScanStatus,
  TStageStatus,
} from '@/types/enums/scan.enum';

/** Row shapes of the tables in supabase/migrations/20261107000000_init.sql. */

export interface TScanRow {
  id: string;
  input_url: string;
  origin: string;
  domain: string;
  brand_name: string | null;
  status: TScanStatus;
  current_stage: TScanStage | null;
  share_token: string;
  scan_date: string;
  model_version: string;
  engines: TEngine[];
  fact_sheet_version: number;
  skip_requested: boolean;
  facts_ready_at: string | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  heartbeat_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TStageMetaJson {
  done?: number;
  total?: number;
  current_engine?: TEngine;
}

export interface TScanStageRow {
  id: number;
  scan_id: string;
  stage: TScanStage;
  stage_order: number;
  status: TStageStatus;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  meta: TStageMetaJson;
  error: string | null;
}

export interface THeading {
  level: number;
  text: string;
}

export interface TPageRow {
  id: number;
  scan_id: string;
  url: string;
  route: string;
  page_type: TPageType;
  http_status: number | null;
  title: string | null;
  meta_description: string | null;
  canonical: string | null;
  text_content: string | null;
  main_text: string | null;
  word_count: number | null;
  html_bytes: number | null;
  headings: THeading[];
  jsonld: unknown[];
  header_last_modified: string | null;
  sitemap_lastmod: string | null;
  fetched_at: string | null;
  fetch_error: string | null;
}

export interface THealthIssue {
  code: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

export interface TPageHealthRow {
  id: number;
  page_id: number;
  scan_id: string;
  bot_access: Record<string, 'allowed' | 'blocked'>;
  bots_allowed: number;
  readable_without_js: boolean | null;
  text_ratio: number | null;
  schema_types: string[];
  expected_schema_ok: boolean | null;
  last_updated: string | null;
  freshness_days: number | null;
  issues: THealthIssue[];
  route_score: number | null;
}

export interface TSiteHealthRow {
  scan_id: string;
  robots_found: boolean;
  robots_txt: string | null;
  site_bot_access: Record<string, 'allowed' | 'blocked'>;
  blocked_bots: number;
  llms_txt_found: boolean;
  llms_txt: string | null;
  sitemap_found: boolean;
  sitemap_urls: number;
  site_score: number | null;
}

export interface TFactRow {
  id: number;
  scan_id: string;
  key: string;
  fact_group: TFactGroup;
  label: string;
  value: string | null;
  status: TFactStatus;
  note: string | null;
  confirmed: boolean;
  source_page_id: number | null;
  source_route: string | null;
  source_quote: string | null;
  quote_verified: boolean;
  sort_order: number;
  edited_by_user: boolean;
}

export interface TCompetitorRow {
  id: number;
  scan_id: string;
  name: string;
  origin: TEntityOrigin;
  source_route: string | null;
  domain: string | null;
}

export interface TRatingRow {
  id: number;
  scan_id: string;
  platform: TRatingPlatform;
  value: number | null;
  count: number | null;
  source_url: string | null;
  origin: TEntityOrigin;
  confirmed: boolean;
}

export interface TQuestionRow {
  id: number;
  scan_id: string;
  intent: TIntent;
  text: string;
  weight: number;
  names_brand: boolean;
  sort_order: number;
}

export interface TCitation {
  url: string;
  title?: string | null;
}

export interface TAnswerRow {
  id: number;
  scan_id: string;
  question_id: number;
  engine: TEngine;
  status: TAnswerStatus;
  raw_text: string | null;
  citations: TCitation[];
  model: string | null;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
}

export interface TRatingQuoted {
  platform: string;
  value: number | null;
  count: number | null;
}

export interface TJudgmentRow {
  id: number;
  answer_id: number;
  scan_id: string;
  fact_sheet_version: number;
  mentioned: boolean;
  mention_position: TPosition;
  cited_our_pages: string[];
  should_cite_route: string | null;
  why: string | null;
  sentiment: TSentiment;
  competitors_mentioned: string[];
  source_classes: Partial<Record<TSourceClass, number>>;
  ratings_quoted: TRatingQuoted[];
  positive_themes: string[];
  negative_themes: string[];
  review_sources: string[];
}

export interface TClaimRow {
  id: number;
  judgment_id: number;
  scan_id: string;
  engine: TEngine;
  text: string;
  kind: TClaimKind;
  verdict: TVerdict;
  fact_key: string | null;
  fact_value: string | null;
  suggested_correction: string | null;
}

export interface TScoreRow {
  id: number;
  scan_id: string;
  version: number;
  fact_sheet_version: number;
  total: number;
  grade: string;
  visibility: number;
  accuracy: number;
  reputation: number;
  site_health: number;
  content_readiness: number;
  by_engine: Partial<Record<TEngine, number>>;
  share_of_voice: { name: string; mentions: number; pct: number; is_us: boolean }[];
  breakdown: Record<string, unknown>;
  notes: string[];
  computed_at: string;
}

export interface TFixRow {
  id: number;
  scan_id: string;
  score_version: number;
  fix_type: TFixType;
  rank: number;
  is_top3: boolean;
  title: string;
  sub_scores: TSubScore[];
  lift_points: number;
  effort: TEffort;
  route: string;
  placement: string | null;
  gap_question_id: number | null;
  gap_summary: string | null;
  why: string | null;
  draft_copy: string | null;
  draft_word_count: number | null;
  notes: string[];
  code_block: string | null;
  code_lang: string | null;
  unconfirmed_keys: string[];
  done: boolean;
  regenerations: number;
}
