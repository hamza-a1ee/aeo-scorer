import { competitorSchema } from '@/schema/competitor.schema';
import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { HttpError } from '@/server/http-error';
import { toCompetitor } from '@/server/presenters/fact-sheet.presenter';
import { addCompetitors } from '@/server/repositories/fact-sheet.repo';
import { bumpFactSheetVersion } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string }> };

export const POST = handleRoute(async (req, { params }: TCtx) => {
  const { id } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  const { name } = competitorSchema.parse(await req.json());
  const [added] = await addCompetitors(scan.id, [{ name, origin: 'user', source_route: null, domain: null }]);
  if (!added) throw new HttpError(409, `${name} is already on the list`);
  await bumpFactSheetVersion(scan);
  return ok(toCompetitor(added), 'Competitor added', 201);
});
