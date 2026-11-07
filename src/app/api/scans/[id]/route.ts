import { after } from 'next/server';

import { sampleScanStatus } from '@/constants/sample-scan.constant';
import { isSample, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { isPipelineRunning, startPipeline } from '@/server/pipeline/orchestrator';
import { getScanStatusView } from '@/server/presenters/scan-status.presenter';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ id: string }> };

export const GET = handleRoute(async (_req, { params }: TCtx) => {
  const { id } = await params;
  if (isSample(id)) return ok(sampleScanStatus());
  const scan = await scanOr404(id);
  // A queued scan whose background task never started (e.g. a restart) is kicked here.
  if (scan.status === 'queued' && !isPipelineRunning(scan.id)) after(() => startPipeline(scan.id));
  return ok(await getScanStatusView(scan));
});
