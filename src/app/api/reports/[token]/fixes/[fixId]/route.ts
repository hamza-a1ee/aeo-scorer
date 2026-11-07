import { fixDoneSchema } from '@/schema/fix-done.schema';
import { assertWritable, isSample } from '@/server/access.util';
import { handleRoute, ok, parseIntParam } from '@/server/api-response.util';
import { toFix } from '@/server/presenters/fix.presenter';
import { fixLookup, fixOr404, sampleFixOr404 } from '@/server/report-access.util';
import { updateFix } from '@/server/repositories/score.repo';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ token: string; fixId: string }> };

export const GET = handleRoute(async (_req, { params }: TCtx) => {
  const { token, fixId } = await params;
  const fid = parseIntParam(fixId, 'Fix');
  if (isSample(token)) return ok(sampleFixOr404(fid));
  const { scan, fix } = await fixOr404(token, fid);
  return ok(toFix(fix, await fixLookup(scan.id)));
});

export const PATCH = handleRoute(async (req, { params }: TCtx) => {
  const { token, fixId } = await params;
  assertWritable(token);
  const { scan, fix } = await fixOr404(token, parseIntParam(fixId, 'Fix'));
  const { done } = fixDoneSchema.parse(await req.json());
  const updated = await updateFix(fix.id, { done });
  return ok(toFix(updated, await fixLookup(scan.id)), done ? 'Marked as done' : 'Marked as not done');
});
