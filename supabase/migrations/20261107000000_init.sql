-- =====================================================================
-- AEO App · initial schema · scoring model v1.0
-- Idempotent: enums guarded by DO blocks, tables/indexes use IF NOT EXISTS.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'scan_status') then
    create type public.scan_status as enum ('queued','running','completed','partial','failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'scan_stage') then
    create type public.scan_stage as enum ('crawl','health','facts','questions','engines','judge','report');
  end if;
  if not exists (select 1 from pg_type where typname = 'stage_status') then
    create type public.stage_status as enum ('pending','running','done','failed','skipped');
  end if;
  if not exists (select 1 from pg_type where typname = 'page_type') then
    create type public.page_type as enum ('home','pricing','product','features','compare','docs','faq','blog','about','integrations','security','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'fact_group') then
    create type public.fact_group as enum ('basics','pricing','features');
  end if;
  if not exists (select 1 from pg_type where typname = 'fact_status') then
    create type public.fact_status as enum ('ok','ambiguous','missing');
  end if;
  if not exists (select 1 from pg_type where typname = 'entity_origin') then
    create type public.entity_origin as enum ('site','engine','user');
  end if;
  if not exists (select 1 from pg_type where typname = 'rating_platform') then
    create type public.rating_platform as enum ('g2','capterra','app_store','google_play','trustpilot');
  end if;
  if not exists (select 1 from pg_type where typname = 'question_intent') then
    create type public.question_intent as enum ('category','definition','feature','comparison','task','reputation');
  end if;
  if not exists (select 1 from pg_type where typname = 'answer_engine') then
    create type public.answer_engine as enum ('gemini','chatgpt','perplexity');
  end if;
  if not exists (select 1 from pg_type where typname = 'answer_status') then
    create type public.answer_status as enum ('ok','failed','skipped');
  end if;
  if not exists (select 1 from pg_type where typname = 'mention_position') then
    create type public.mention_position as enum ('first','listed','absent');
  end if;
  if not exists (select 1 from pg_type where typname = 'sentiment') then
    create type public.sentiment as enum ('positive','neutral','negative','na');
  end if;
  if not exists (select 1 from pg_type where typname = 'claim_kind') then
    create type public.claim_kind as enum ('pricing','feature','platform','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'claim_verdict') then
    create type public.claim_verdict as enum ('correct','wrong','unverifiable');
  end if;
  if not exists (select 1 from pg_type where typname = 'fix_effort') then
    create type public.fix_effort as enum ('minutes','hours','days');
  end if;
  if not exists (select 1 from pg_type where typname = 'sub_score') then
    create type public.sub_score as enum ('visibility','accuracy','reputation','site_health','content_readiness');
  end if;
  if not exists (select 1 from pg_type where typname = 'fix_type') then
    create type public.fix_type as enum ('robots_patch','definitional_paragraph','product_jsonld','llms_txt','feature_summary','rating_fix','freshness_note','directory_checklist');
  end if;
end $$;

-- ---------- updated_at trigger function ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- scans ----------
create table if not exists public.scans (
  id                  uuid primary key default gen_random_uuid(),
  input_url           text not null,
  origin              text not null,                       -- https://host
  domain              text not null,                       -- apex host, no www
  brand_name          text,
  status              public.scan_status not null default 'queued',
  current_stage       public.scan_stage,
  share_token         text not null unique,
  scan_date           date not null default current_date,
  model_version       text not null default '1.0',
  engines             public.answer_engine[] not null default '{}',
  fact_sheet_version  integer not null default 1,
  skip_requested      boolean not null default false,
  facts_ready_at      timestamptz,
  error               text,
  started_at          timestamptz,
  completed_at        timestamptz,
  heartbeat_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint scans_one_per_domain_per_day unique (domain, scan_date)
);
create index if not exists scans_status_heartbeat_idx on public.scans (status, heartbeat_at);
drop trigger if exists scans_set_updated_at on public.scans;
create trigger scans_set_updated_at before update on public.scans
  for each row execute function public.set_updated_at();

-- ---------- scan_stages ----------
create table if not exists public.scan_stages (
  id           bigint generated always as identity primary key,
  scan_id      uuid not null references public.scans(id) on delete cascade,
  stage        public.scan_stage not null,
  stage_order  smallint not null,                          -- 1..7
  status       public.stage_status not null default 'pending',
  started_at   timestamptz,
  finished_at  timestamptz,
  duration_ms  integer,
  meta         jsonb not null default '{}'::jsonb,         -- {done,total,current_engine}
  error        text,
  constraint scan_stages_unique unique (scan_id, stage)
);
create index if not exists scan_stages_scan_id_idx on public.scan_stages (scan_id);

-- ---------- pages ----------
create table if not exists public.pages (
  id                    bigint generated always as identity primary key,
  scan_id               uuid not null references public.scans(id) on delete cascade,
  url                   text not null,
  route                 text not null,                     -- path only, e.g. /pricing
  page_type             public.page_type not null default 'other',
  http_status           integer,
  title                 text,
  meta_description      text,
  canonical             text,
  text_content          text,
  main_text             text,
  word_count            integer,
  html_bytes            integer,
  headings              jsonb not null default '[]'::jsonb,
  jsonld                jsonb not null default '[]'::jsonb,
  header_last_modified  timestamptz,
  sitemap_lastmod       timestamptz,
  fetched_at            timestamptz,
  fetch_error           text,
  constraint pages_unique_url unique (scan_id, url)
);
create index if not exists pages_scan_type_idx on public.pages (scan_id, page_type);

-- ---------- page_health ----------
create table if not exists public.page_health (
  id                   bigint generated always as identity primary key,
  page_id              bigint not null unique references public.pages(id) on delete cascade,
  scan_id              uuid not null references public.scans(id) on delete cascade,
  bot_access           jsonb not null default '{}'::jsonb,  -- {"GPTBot":"allowed",...}
  bots_allowed         smallint not null default 0,
  readable_without_js  boolean,
  text_ratio           numeric(5,4),
  schema_types         text[] not null default '{}',
  expected_schema_ok   boolean,
  last_updated         date,
  freshness_days       integer,
  issues               jsonb not null default '[]'::jsonb,  -- [{code,severity,detail}]
  route_score          numeric(5,2)
);
create index if not exists page_health_scan_id_idx on public.page_health (scan_id);

-- ---------- site_health ----------
create table if not exists public.site_health (
  scan_id          uuid primary key references public.scans(id) on delete cascade,
  robots_found     boolean not null default false,
  robots_txt       text,
  site_bot_access  jsonb not null default '{}'::jsonb,
  blocked_bots     smallint not null default 0,
  llms_txt_found   boolean not null default false,
  llms_txt         text,
  sitemap_found    boolean not null default false,
  sitemap_urls     integer not null default 0,
  site_score       numeric(5,2)
);

-- ---------- facts ----------
create table if not exists public.facts (
  id              bigint generated always as identity primary key,
  scan_id         uuid not null references public.scans(id) on delete cascade,
  key             text not null,                           -- from FACT_CATALOG
  fact_group      public.fact_group not null,
  label           text not null,
  value           text,
  status          public.fact_status not null default 'missing',
  note            text,
  confirmed       boolean not null default false,
  source_page_id  bigint references public.pages(id) on delete set null,
  source_route    text,
  source_quote    text,
  quote_verified  boolean not null default false,
  sort_order      smallint not null default 0,
  edited_by_user  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint facts_unique_key unique (scan_id, key)
);
create index if not exists facts_source_page_id_idx on public.facts (source_page_id);
drop trigger if exists facts_set_updated_at on public.facts;
create trigger facts_set_updated_at before update on public.facts
  for each row execute function public.set_updated_at();

-- ---------- competitors ----------
create table if not exists public.competitors (
  id            bigint generated always as identity primary key,
  scan_id       uuid not null references public.scans(id) on delete cascade,
  name          text not null,
  origin        public.entity_origin not null default 'site',
  source_route  text,
  domain        text,
  created_at    timestamptz not null default now()
);
create unique index if not exists competitors_unique_name_idx on public.competitors (scan_id, lower(name));

-- ---------- ratings ----------
create table if not exists public.ratings (
  id          bigint generated always as identity primary key,
  scan_id     uuid not null references public.scans(id) on delete cascade,
  platform    public.rating_platform not null,
  value       numeric(3,2),
  count       integer,
  source_url  text,
  origin      public.entity_origin not null default 'site',
  confirmed   boolean not null default false,
  constraint ratings_unique_platform unique (scan_id, platform)
);

-- ---------- questions ----------
create table if not exists public.questions (
  id           bigint generated always as identity primary key,
  scan_id      uuid not null references public.scans(id) on delete cascade,
  intent       public.question_intent not null,
  text         text not null,
  weight       smallint not null default 1,                -- 2 for category/task
  names_brand  boolean not null default false,
  sort_order   smallint not null default 0
);
create index if not exists questions_scan_id_idx on public.questions (scan_id);

-- ---------- answers ----------
create table if not exists public.answers (
  id           bigint generated always as identity primary key,
  scan_id      uuid not null references public.scans(id) on delete cascade,
  question_id  bigint not null references public.questions(id) on delete cascade,
  engine       public.answer_engine not null,
  status       public.answer_status not null default 'ok',
  raw_text     text,
  citations    jsonb not null default '[]'::jsonb,         -- [{url,title}]
  model        text,
  latency_ms   integer,
  error        text,
  created_at   timestamptz not null default now(),
  constraint answers_unique_engine unique (question_id, engine)
);
create index if not exists answers_scan_id_idx on public.answers (scan_id);

-- ---------- judgments ----------
create table if not exists public.judgments (
  id                     bigint generated always as identity primary key,
  answer_id              bigint not null unique references public.answers(id) on delete cascade,
  scan_id                uuid not null references public.scans(id) on delete cascade,
  fact_sheet_version     integer not null,
  mentioned              boolean not null default false,
  mention_position       public.mention_position not null default 'absent',
  cited_our_pages        text[] not null default '{}',
  should_cite_route      text,
  why                    text,
  sentiment              public.sentiment not null default 'na',
  competitors_mentioned  text[] not null default '{}',
  source_classes         jsonb not null default '{}'::jsonb, -- {your_site,competitor_sites,reddit_forums,review_sites,roundups,other}
  ratings_quoted         jsonb not null default '[]'::jsonb, -- [{platform,value,count}]
  negative_themes        text[] not null default '{}',
  review_sources         text[] not null default '{}',
  judged_at              timestamptz not null default now()
);
create index if not exists judgments_scan_version_idx on public.judgments (scan_id, fact_sheet_version);

-- ---------- claims ----------
create table if not exists public.claims (
  id                    bigint generated always as identity primary key,
  judgment_id           bigint not null references public.judgments(id) on delete cascade,
  scan_id               uuid not null references public.scans(id) on delete cascade,
  engine                public.answer_engine not null,
  text                  text not null,
  kind                  public.claim_kind not null default 'other',
  verdict               public.claim_verdict not null,
  fact_key              text,
  fact_value            text,
  suggested_correction  text
);
create index if not exists claims_judgment_id_idx on public.claims (judgment_id);
create index if not exists claims_scan_verdict_idx on public.claims (scan_id, verdict);

-- ---------- scores ----------
create table if not exists public.scores (
  id                  bigint generated always as identity primary key,
  scan_id             uuid not null references public.scans(id) on delete cascade,
  version             integer not null default 1,
  fact_sheet_version  integer not null,
  total               numeric(5,2) not null,
  grade               char(1) not null,
  visibility          numeric(5,2) not null,               -- /25
  accuracy            numeric(5,2) not null,               -- /25
  reputation          numeric(5,2) not null,               -- /10
  site_health         numeric(5,2) not null,               -- /25
  content_readiness   numeric(5,2) not null,               -- /15
  by_engine           jsonb not null default '{}'::jsonb,  -- {"gemini":58,...}
  share_of_voice      jsonb not null default '[]'::jsonb,  -- [{name,mentions,pct,is_us}]
  breakdown           jsonb not null default '{}'::jsonb,
  notes               text[] not null default '{}',
  computed_at         timestamptz not null default now(),
  constraint scores_unique_version unique (scan_id, version)
);

-- ---------- fixes ----------
create table if not exists public.fixes (
  id                bigint generated always as identity primary key,
  scan_id           uuid not null references public.scans(id) on delete cascade,
  score_version     integer not null,
  fix_type          public.fix_type not null,
  rank              smallint not null,
  is_top3           boolean not null default false,
  title             text not null,
  sub_scores        public.sub_score[] not null default '{}',
  lift_points       numeric(5,2) not null default 0,
  effort            public.fix_effort not null,
  route             text not null,
  placement         text,                                   -- e.g. "Above the fold"
  gap_question_id   bigint references public.questions(id) on delete set null,
  gap_summary       text,
  why               text,
  draft_copy        text,
  draft_word_count  integer,
  notes             text[] not null default '{}',
  code_block        text,
  code_lang         text,                                   -- json | text
  unconfirmed_keys  text[] not null default '{}',
  done              boolean not null default false,
  regenerations     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint fixes_unique_per_version unique (scan_id, score_version, fix_type, route)
);
create index if not exists fixes_scan_rank_idx on public.fixes (scan_id, rank);
create index if not exists fixes_gap_question_id_idx on public.fixes (gap_question_id);
drop trigger if exists fixes_set_updated_at on public.fixes;
create trigger fixes_set_updated_at before update on public.fixes
  for each row execute function public.set_updated_at();

-- ---------- row level security: lock everything down ----------
-- No policies are created on purpose. anon/authenticated get nothing;
-- the server uses the service-role key, which bypasses RLS.
alter table public.scans        enable row level security;
alter table public.scan_stages  enable row level security;
alter table public.pages        enable row level security;
alter table public.page_health  enable row level security;
alter table public.site_health  enable row level security;
alter table public.facts        enable row level security;
alter table public.competitors  enable row level security;
alter table public.ratings      enable row level security;
alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.judgments    enable row level security;
alter table public.claims       enable row level security;
alter table public.scores       enable row level security;
alter table public.fixes        enable row level security;

-- Belt and braces: revoke table access from the public API roles too.
revoke all on all tables in schema public from anon, authenticated;
