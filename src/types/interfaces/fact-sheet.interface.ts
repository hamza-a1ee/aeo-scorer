import type {
  TEntityOrigin,
  TFactGroup,
  TFactStatus,
  TRatingPlatform,
} from '@/types/enums/fact.enum';
import type { TScanStatus } from '@/types/enums/scan.enum';

export interface IFact {
  id: number;
  key: string;
  group: TFactGroup;
  label: string;
  value: string | null;
  status: TFactStatus;
  note: string | null;
  confirmed: boolean;
  sourceRoute: string | null;
  sourceQuote: string | null;
  editedByUser: boolean;
}

export interface IFactGroupView {
  group: TFactGroup;
  title: string;
  hint: string;
  facts: IFact[];
}

export interface ICompetitor {
  id: number;
  name: string;
  origin: TEntityOrigin;
  sourceRoute: string | null;
}

export interface IRating {
  platform: TRatingPlatform;
  label: string;
  value: number | null;
  count: number | null;
  sourceUrl: string | null;
  origin: TEntityOrigin | null;
}

export interface IFactSheet {
  scanId: string;
  domain: string;
  brandName: string | null;
  status: TScanStatus;
  version: number;
  factCount: number;
  pageCount: number;
  groups: IFactGroupView[];
  competitors: ICompetitor[];
  ratings: IRating[];
  readOnly: boolean;
}

export interface IFactPatchPayload {
  value: string | null;
}

export interface ICompetitorPayload {
  name: string;
}

export interface IRatingPatchPayload {
  platform: TRatingPlatform;
  value: number | null;
  count?: number | null;
}
