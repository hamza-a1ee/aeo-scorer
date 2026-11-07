import { assertWritable } from '@/server/access.util';
import { handleRoute, ok, parseIntParam } from '@/server/api-response.util';
import { buildFixContent } from '@/server/fixes/build-fix.util';
import { focusForRoute } from '@/server/fixes/select-fixes.util';
import { toFix } from '@/server/presenters/fix.presenter';
import { fixLookup, fixOr404 } from '@/server/report-access.util';
import { updateFix } from '@/server/repositories/score.repo';
import { loadScanData } from '@/server/scoring/score-input.util';

type TCtx = { params: Promise<{ token: string; fixId: string }> };

/** Re-drafts one fix from the current fact sheet. */
export const POST = handleRoute(async (_req, { params }: TCtx) => {
  const { token, fixId } = await params;
  assertWritable(token);
  const { scan, fix } = await fixOr404(token, parseIntParam(fixId, 'Fix'));
  const data = await loadScanData(scan.id);
  const variant = fix.regenerations + 1;
  const content = await buildFixContent(
    {
      type: fix.fix_type,
      route: fix.route,
      title: fix.title,
      why: fix.why ?? '',
      gap: fix.gap_summary ?? '',
      gapQuestionId: fix.gap_question_id,
      focus: fix.fix_type === 'feature_summary' ? focusForRoute(data, fix.route) : null,
    },
    data,
    variant,
  );
  const updated = await updateFix(fix.id, { ...content, regenerations: variant });
  return ok(toFix(updated, await fixLookup(scan.id)), 'New draft written');
});
