-- Adds the praise themes the report shows in green next to the negative ones.
-- Safe to re-run.
alter table public.judgments
  add column if not exists positive_themes text[] not null default '{}';
