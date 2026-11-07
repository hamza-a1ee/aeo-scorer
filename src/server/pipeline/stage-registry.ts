import 'server-only';

import type { TScanStage } from '@/types/enums/scan.enum';

import type { IPipelineStage } from './pipeline-context.type';
import { crawlStage } from './stages/crawl.stage';
import { enginesStage } from './stages/engines.stage';
import { factsStage } from './stages/facts.stage';
import { healthStage } from './stages/health.stage';
import { judgeStage } from './stages/judge.stage';
import { questionsStage } from './stages/questions.stage';
import { reportStage } from './stages/report.stage';

export const STAGE_REGISTRY: Record<TScanStage, IPipelineStage> = {
  crawl: crawlStage,
  health: healthStage,
  facts: factsStage,
  questions: questionsStage,
  engines: enginesStage,
  judge: judgeStage,
  report: reportStage,
};
