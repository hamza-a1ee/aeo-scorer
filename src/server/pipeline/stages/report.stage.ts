import 'server-only';

import pLimit from 'p-limit';

import { FIX_TYPE_META, MAX_FIXES } from '@/constants/fix-types.constant';
import { SCORING_MODEL_VERSION } from '@/constants/scoring-weights.constant';
import type { TFixRow } from '@/lib/supabase/rows.type';
import { buildFixContent } from '@/server/fixes/build-fix.util';
import { rankFixes, selectFixCandidates } from '@/server/fixes/select-fixes.util';
import { getLatestScore, insertFixes, insertScore } from '@/server/repositories/score.repo';
import { listStages, updateScan } from '@/server/repositories/scan.repo';
import { buildScoreInput, loadScanData } from '@/server/scoring/score-input.util';
import { computeScore } from '@/server/scoring/score.util';

import type { IPipelineStage } from '../pipeline-context.type';

/** Stage 7: score (new version), select + rank + draft fixes, close the scan. */
export const reportStage: IPipelineStage = {
  key: 'report',
  async run(ctx) {
    const scan = await ctx.refresh();
    const data = await loadScanData(scan.id);
    const input = buildScoreInput(data);
    const result = computeScore(input);
    await ctx.progress({ done: 1, total: 3 });

    const version = ((await getLatestScore(scan.id))?.version ?? 0) + 1;
    await insertScore({
      scan_id: scan.id,
      version,
      fact_sheet_version: scan.fact_sheet_version,
      total: result.total,
      grade: result.grade,
      visibility: result.visibility,
      accuracy: result.accuracy,
      reputation: result.reputation,
      site_health: result.site_health,
      content_readiness: result.content_readiness,
      by_engine: result.byEngine,
      share_of_voice: result.shareOfVoice,
      breakdown: { ...result.breakdown, model_version: SCORING_MODEL_VERSION, rating_checks: result.ratingChecks },
      notes: result.notes,
    });
    ctx.log(`score v${version}: ${result.total} (${result.grade})`);
    await ctx.progress({ done: 2, total: 3 });

    const ranked = rankFixes(selectFixCandidates(data, input, result), input, result).slice(0, MAX_FIXES);
    const limit = pLimit(3);
    const rows: Omit<TFixRow, 'id'>[] = await Promise.all(
      ranked.map(fix =>
        limit(async () => {
          const meta = FIX_TYPE_META[fix.type];
          const content = await buildFixContent(fix, data);
          return {
            scan_id: scan.id,
            score_version: version,
            fix_type: fix.type,
            rank: fix.rank,
            is_top3: fix.isTop3,
            title: fix.title,
            sub_scores: meta.subScores,
            lift_points: fix.lift,
            effort: meta.effort,
            route: fix.route,
            placement: meta.placement,
            gap_question_id: fix.gapQuestionId,
            gap_summary: fix.gap,
            why: fix.why,
            done: false,
            regenerations: 0,
            ...content,
          };
        }),
      ),
    );
    await insertFixes(rows);
    await ctx.progress({ done: 3, total: 3 });

    // Partial when the user skipped, or engines/judging did not cover every question.
    const stages = await listStages(scan.id);
    const fresh = await ctx.refresh();
    const expected = data.questions.length * fresh.engines.length;
    const answered = data.answers.filter(a => a.status === 'ok').length;
    const partial =
      fresh.skip_requested ||
      stages.some(s => (s.stage === 'engines' || s.stage === 'judge') && s.status === 'skipped') ||
      answered < expected;
    await updateScan(scan.id, {
      status: partial ? 'partial' : 'completed',
      completed_at: new Date().toISOString(),
      current_stage: 'report',
    });
  },
};
