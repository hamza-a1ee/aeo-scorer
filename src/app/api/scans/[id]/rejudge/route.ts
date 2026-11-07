import { after } from 'next/server';

import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { HttpError } from '@/server/http-error';
import { isPipelineRunning, startPipeline } from '@/server/pipeline/orchestrator';
import { countAnswers } from '@/server/repositories/answer.repo';
import { resetStages, updateScan } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string }> };

/** Re-runs judge + report against the edited fact sheet. No crawl, no engine calls. */
export const POST = handleRoute(async (_req, { params }: TCtx) => {
  const { id } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  if (isPipelineRunning(scan.id) || scan.status === 'running' || scan.status === 'queued') {
    throw new HttpError(409, 'The scan is still running. Your edits will be used when it reaches judging.');
  }
  if (!(await countAnswers(scan.id))) {
    throw new HttpError(409, 'There are no answers to re-judge yet');
  }
  await resetStages(scan.id, ['judge', 'report']);
  await updateScan(scan.id, { status: 'running', current_stage: 'judge', completed_at: null, error: null });
  after(() => startPipeline(scan.id, { from: 'judge', force: true }));
  return ok({ status: 'running' }, 'Re-judging answers');
});
