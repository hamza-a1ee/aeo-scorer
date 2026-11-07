import { handleRoute, ok } from '@/server/api-response.util';
import { getReport } from '@/server/report-access.util';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ token: string }> };

/** 409 while the scan is still running; the client retries. */
export const GET = handleRoute(async (_req, { params }: TCtx) => {
  const { token } = await params;
  return ok(await getReport(token));
});
