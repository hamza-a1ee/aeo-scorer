import type {
  TClaimKind,
  TEngine,
  TIntent,
  TPosition,
  TSourceClass,
} from '@/types/enums/answer.enum';
import type { TRatingPlatform } from '@/types/enums/fact.enum';
import type { TSubScore } from '@/types/enums/fix.enum';
import type { TScanStatus } from '@/types/enums/scan.enum';

import type { IFixSummary } from './fix.interface';

export interface ISubScoreView {
  key: TSubScore;
  name: string;
  description: string;
  value: number;
  max: number;
}

export interface IEngineScore {
  engine: TEngine;
  label: string;
  total: number;
}

export interface IGapRow {
  questionId: number;
  question: string;
  intent: TIntent;
  doubled: boolean;
  positions: { engine: TEngine; label: string; position: TPosition }[];
  worst: TPosition;
  cited: string | null;
  shouldCite: string | null;
  why: string;
}

export interface IEngineCitation {
  engine: TEngine;
  label: string;
  /** 0–100 */
  rate: number;
  cited: number;
  total: number;
  topPage: string | null;
  isTop: boolean;
}

export interface ISourceShareRow {
  key: TSourceClass;
  label: string;
  /** engine → percentage 0–100 */
  byEngine: Partial<Record<TEngine, number>>;
}

export interface ICitedPage {
  route: string;
  /** 0–100 */
  pct: number;
  note: string;
  flagged: boolean;
}

export interface IWrongClaim {
  kind: TClaimKind;
  doubled: boolean;
  said: string;
  engineLabel: string;
  question: string;
  truth: string;
  source: string | null;
  correction: string;
}

export interface IRatingCheck {
  platform: TRatingPlatform;
  label: string;
  quoted: string | null;
  real: string | null;
  verdict: 'matches' | 'wrong' | 'missing';
}

export interface IRouteHealthRow {
  route: string;
  type: string;
  access: string;
  accessOk: boolean;
  readable: boolean | null;
  schema: string;
  lastUpdated: string | null;
  stale: boolean;
  issueCount: number;
  issues: { code: string; label: string; detail: string }[];
}

export interface IReport {
  token: string;
  domain: string;
  brandName: string;
  status: TScanStatus;
  finishedAt: string | null;
  modelVersion: string;
  engines: TEngine[];
  score: {
    total: number;
    grade: string;
    isPartial: boolean;
    passes: number;
    subScores: ISubScoreView[];
    byEngine: IEngineScore[];
  };
  topFixes: IFixSummary[];
  gaps: { summary: string; rows: IGapRow[] };
  citations: {
    engines: IEngineCitation[];
    sources: ISourceShareRow[];
    pages: ICitedPage[];
  };
  accuracy: {
    summary: string;
    wrong: IWrongClaim[];
  };
  reputation: {
    title: string;
    sentiment: { positive: number; neutral: number; negative: number; total: number };
    negativeLine: string | null;
    ratings: IRatingCheck[];
    themes: { text: string; tone: 'positive' | 'negative' }[];
    reviewSources: string[];
  };
  siteHealth: {
    summary: string;
    bots: { name: string; allowed: boolean }[];
    routes: IRouteHealthRow[];
  };
  shareOfVoice: {
    summary: string;
    items: { name: string; pct: number; isUs: boolean }[];
  };
  fixes: IFixSummary[];
  runDetails: { label: string; value: string }[];
}
