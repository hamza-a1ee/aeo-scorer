import { factPatchSchema } from '@/schema/fact-patch.schema';
import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok, parseIntParam } from '@/server/api-response.util';
import { HttpError } from '@/server/http-error';
import { toFact } from '@/server/presenters/fact-sheet.presenter';
import { getFact, updateFact } from '@/server/repositories/fact-sheet.repo';
import { bumpFactSheetVersion } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string; factId: string }> };

/** A user edit confirms the fact (or clears it) and bumps the fact-sheet version. */
export const PATCH = handleRoute(async (req, { params }: TCtx) => {
  const { id, factId } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  const fact = await getFact(scan.id, parseIntParam(factId, 'Fact'));
  if (!fact) throw new HttpError(404, 'Fact not found');
  const { value } = factPatchSchema.parse(await req.json());

  const updated = await updateFact(fact.id, {
    value,
    confirmed: !!value,
    status: value ? 'ok' : 'missing',
    note: value ? null : 'Left blank. Fixes will show a [confirm] mark here.',
    edited_by_user: true,
  });
  await bumpFactSheetVersion(scan);
  return ok(toFact(updated), 'Fact saved');
});
