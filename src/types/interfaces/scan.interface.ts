import type { TEngine, TIntent } from '@/types/enums/answer.enum';
import type { TScanStage, TScanStatus, TStageStatus } from '@/types/enums/scan.enum';

export interface ICreateScanPayload {
  url: string;
}

export interface ICreateScanResponse {
  scanId: string;
  shareToken: string;
  status: TScanStatus;
  existing: boolean;
}

export interface IStageView {
  stage: TScanStage;
  order: number;
  title: string;
  description: string;
  status: TStageStatus;
  /** Duration ("0:41"), progress ("12 / 20") or "—". */
  meta: string;
}

export type TLiveVerdict = 'mentioned' | 'absent' | 'wrong_fact' | 'answered';

export interface IAnswerSoFar {
  id: number;
  intent: TIntent;
  question: string;
  engine: TEngine;
  verdict: TLiveVerdict;
}

export interface IScanStatus {
  id: string;
  domain: string;
  brandName: string | null;
  status: TScanStatus;
  currentStage: TScanStage | null;
  stageTitle: string;
  stageOrder: number;
  progressPct: number;
  startedAt: string | null;
  completedAt: string | null;
  stages: IStageView[];
  factsReady: { count: number } | null;
  answersSoFar: IAnswerSoFar[];
  answersProgress: { done: number; total: number; engineLabel: string } | null;
  early: {
    routesCrawled: number | null;
    siteHealth: number | null;
    botsBlocked: number | null;
  };
  shareToken: string;
  engines: TEngine[];
  error: string | null;
}
