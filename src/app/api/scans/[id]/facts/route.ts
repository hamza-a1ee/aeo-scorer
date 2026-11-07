import { SAMPLE_FACT_SHEET } from '@/constants/sample-scan.constant';
import { isSample, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { getFactSheetView } from '@/server/presenters/fact-sheet.presenter';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ id: string }> };

export const GET = handleRoute(async (_req, { params }: TCtx) => {
  const { id } = await params;
  if (isSample(id)) return ok(SAMPLE_FACT_SHEET);
  return ok(await getFactSheetView(await scanOr404(id)));
});
