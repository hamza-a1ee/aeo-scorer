import { SAMPLE_REPORT } from '@/constants/sample-report.constant';
import { isSample } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { toFixSummary } from '@/server/presenters/fix.presenter';
import { readyScan } from '@/server/report-access.util';
import { listFixes } from '@/server/repositories/score.repo';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ token: string }> };

export const GET = handleRoute(async (_req, { params }: TCtx) => {
  const { token } = await params;
  if (isSample(token)) return ok(SAMPLE_REPORT.fixes);
  const { scan, score } = await readyScan(token);
  return ok((await listFixes(scan.id, score.version)).map(toFixSummary));
});
