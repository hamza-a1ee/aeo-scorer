import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { HttpError } from '@/server/http-error';
import { updateScan } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string }> };

/** "Skip to partial report": engines/judge stop between items, report scores what exists. */
export const POST = handleRoute(async (_req, { params }: TCtx) => {
  const { id } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  if (scan.status !== 'running' && scan.status !== 'queued') {
    throw new HttpError(409, 'This scan has already finished');
  }
  await updateScan(scan.id, { skip_requested: true });
  return ok({ status: scan.status }, 'Skipping to a partial report');
});
