import type { IAnswerEngine } from '@/lib/ai/answer-engine.interface';
import type { TServerEnv } from '@/lib/env';
import type { TScanRow, TStageMetaJson } from '@/lib/supabase/rows.type';
import type { TScanStage } from '@/types/enums/scan.enum';

export interface IPipelineContext {
  scan: TScanRow;
  env: TServerEnv;
  engines: IAnswerEngine[];
  userAgent: string;
  /** Re-reads the scan row (fact sheet version, skip flag). */
  refresh(): Promise<TScanRow>;
  /** Writes stage progress meta and the heartbeat. */
  progress(meta: TStageMetaJson): Promise<void>;
  /** True once the user pressed "Skip to partial report". */
  shouldStop(): Promise<boolean>;
  log(message: string): void;
}

export interface IPipelineStage {
  key: TScanStage;
  run(ctx: IPipelineContext): Promise<void>;
}
