import 'server-only';

import { AI_BOTS } from '@/constants/bots.constant';
import { STALE_DAYS } from '@/constants/scoring-weights.constant';
import type { THealthIssue } from '@/lib/supabase/rows.type';
import type { TPageType } from '@/types/enums/scan.enum';

import { type TBotAccess, countAllowed } from './bot-access.util';
import { expectedSchemaLabel } from './schema-detect.util';

export interface IRouteHealthInput {
  pageType: TPageType;
  httpStatus: number | null;
  wordCount: number;
  h1Count: number;
  jsShell: boolean;
  textRatio: number;
  botAccess: TBotAccess;
  schemaTypes: string[];
  expectedSchemaOk: boolean | null;
  freshnessDays: number | null;
  metaRobots: string | null;
  hasCanonical: boolean;
  priceInHtml: boolean | null;
}

export function isReadableWithoutJs(i: Pick<IRouteHealthInput, 'wordCount' | 'h1Count' | 'jsShell'>) {
  return i.wordCount >= 120 && i.h1Count > 0 && !i.jsShell;
}

/** 0–100 route score plus the issue list shown in the report. */
export function scoreRoute(i: IRouteHealthInput): { score: number; readable: boolean; issues: THealthIssue[] } {
  const issues: THealthIssue[] = [];
  const allowed = countAllowed(i.botAccess);
  const readable = isReadableWithoutJs(i);

  const access = 40 * (allowed / AI_BOTS.length);
  if (allowed < AI_BOTS.length) {
    const blocked = Object.entries(i.botAccess).filter(([, v]) => v === 'blocked').map(([k]) => k);
    issues.push({ code: 'BOTS_BLOCKED', severity: 'high', detail: `${blocked.join(', ')} blocked` });
  }

  const readablePts = readable ? 25 : i.wordCount >= 60 ? 10 : 0;
  if (i.jsShell) {
    issues.push({ code: 'JS_ONLY', severity: 'high', detail: 'Content is built client-side; raw HTML has almost no text.' });
  } else if (i.wordCount < 120) {
    issues.push({ code: 'THIN_CONTENT', severity: 'medium', detail: `Only ${i.wordCount} words of text.` });
  }
  if (i.h1Count === 0) issues.push({ code: 'NO_H1', severity: 'low', detail: 'No <h1> heading.' });
  if (i.priceInHtml === false) {
    issues.push({ code: 'PRICE_NOT_IN_HTML', severity: 'high', detail: 'No prices in the raw HTML; the price table is likely built client-side.' });
  }

  let schemaPts = 0;
  if (i.schemaTypes.length) schemaPts += 10;
  if (i.expectedSchemaOk === true) schemaPts += 10;
  else if (i.expectedSchemaOk === null && i.schemaTypes.length) schemaPts += 10;
  if (!i.schemaTypes.length) {
    issues.push({ code: 'NO_SCHEMA', severity: 'medium', detail: 'No JSON-LD or microdata.' });
  } else if (i.expectedSchemaOk === false) {
    issues.push({ code: 'MISSING_EXPECTED_SCHEMA', severity: 'medium', detail: `Expected ${expectedSchemaLabel(i.pageType)} schema.` });
  }

  let freshPts = 5;
  if (i.freshnessDays !== null) {
    freshPts = i.freshnessDays <= 90 ? 15 : i.freshnessDays <= 365 ? 8 : 0;
    if (i.freshnessDays > STALE_DAYS) {
      issues.push({ code: 'STALE_CONTENT', severity: 'medium', detail: `Last updated ${i.freshnessDays} days ago.` });
    }
  } else if (['home', 'pricing', 'features', 'product', 'compare'].includes(i.pageType)) {
    issues.push({ code: 'NO_DATE', severity: 'low', detail: 'No visible or machine-readable last-updated date.' });
  }

  if (i.metaRobots && /\bnoindex\b/.test(i.metaRobots)) {
    issues.push({ code: 'NOINDEX', severity: 'high', detail: 'Page is marked noindex.' });
  }
  if (!i.hasCanonical) issues.push({ code: 'NO_CANONICAL', severity: 'low', detail: 'No canonical link.' });

  return {
    score: Math.round((access + readablePts + schemaPts + freshPts) * 100) / 100,
    readable,
    issues,
  };
}

export const ISSUE_LABELS: Record<string, string> = {
  BOTS_BLOCKED: 'robots.txt',
  JS_ONLY: 'no-JS render',
  THIN_CONTENT: 'thin content',
  NO_H1: 'no h1',
  PRICE_NOT_IN_HTML: 'no-JS render',
  NO_SCHEMA: 'schema',
  MISSING_EXPECTED_SCHEMA: 'schema',
  STALE_CONTENT: 'freshness',
  NO_DATE: 'freshness',
  NOINDEX: 'noindex',
  NO_CANONICAL: 'canonical',
  CRAWLER_BLOCKED: 'robots.txt',
  HTTP_ERROR: 'http',
};
