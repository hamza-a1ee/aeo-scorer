import { ratingPatchSchema } from '@/schema/rating-patch.schema';
import { assertWritable, scanOr404 } from '@/server/access.util';
import { handleRoute, ok } from '@/server/api-response.util';
import { toRating } from '@/server/presenters/fact-sheet.presenter';
import { listRatings, upsertRatings } from '@/server/repositories/fact-sheet.repo';
import { bumpFactSheetVersion } from '@/server/repositories/scan.repo';

type TCtx = { params: Promise<{ id: string }> };

export const PATCH = handleRoute(async (req, { params }: TCtx) => {
  const { id } = await params;
  assertWritable(id);
  const scan = await scanOr404(id);
  const body = ratingPatchSchema.parse(await req.json());
  const current = (await listRatings(scan.id)).find(r => r.platform === body.platform);
  const [saved] = await upsertRatings([
    {
      scan_id: scan.id,
      platform: body.platform,
      value: body.value,
      count: body.count === undefined ? (current?.count ?? null) : body.count,
      source_url: current?.source_url ?? null,
      origin: 'user',
      confirmed: body.value !== null,
    },
  ]);
  await bumpFactSheetVersion(scan);
  return ok(toRating(saved), 'Rating saved');
});
