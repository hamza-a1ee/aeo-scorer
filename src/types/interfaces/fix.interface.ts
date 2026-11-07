import type { TEffort, TFixType, TSubScore } from '@/types/enums/fix.enum';

export interface IFixSummary {
  id: number;
  type: TFixType;
  rank: number;
  isTop3: boolean;
  title: string;
  liftPoints: number;
  effort: TEffort;
  route: string;
  gap: string;
  why: string;
  done: boolean;
}

export interface IFix extends IFixSummary {
  subScores: TSubScore[];
  placement: string | null;
  draftCopy: string | null;
  draftHeading: string | null;
  draftWordCount: number | null;
  notes: string[];
  codeBlock: string | null;
  codeLang: string | null;
  codeTitle: string | null;
  /** The "Closes this gap" sentence on the fix page. */
  gapDetail: string;
  unconfirmedCount: number;
  regenerations: number;
}
