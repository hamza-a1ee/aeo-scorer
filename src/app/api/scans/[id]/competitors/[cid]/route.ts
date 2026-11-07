import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok, parseIntParam } from '@/server/api-response.util';
import { deleteCompetitor } from '@/server/repositories/fact-sheet.repo';
import { bumpFactSheetVersion } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string; cid: string }> };

export const DELETE = handleRoute(async (_req, { params }: TCtx) => {
  const { id, cid } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  const competitorId = parseIntParam(cid, 'Competitor');
  await deleteCompetitor(scan.id, competitorId);
  await bumpFactSheetVersion(scan);
  return ok({ id: competitorId }, 'Competitor removed');
});
