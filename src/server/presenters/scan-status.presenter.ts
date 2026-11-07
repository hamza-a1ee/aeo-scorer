import 'server-only';

import { ENGINE_LABELS } from '@/constants/engines.constant';
import { STAGE_BY_KEY, STAGE_META } from '@/constants/stages.constant';
import type { TScanRow, TScanStageRow } from '@/lib/supabase/rows.type';
import { brandAliases, mentionsBrand } from '@/server/judge/brand.util';
import { listAnswers, listClaims, listJudgments, listQuestions } from '@/server/repositories/answer.repo';
import { listFacts } from '@/server/repositories/fact-sheet.repo';
import { countFetchedPages, getSiteHealth, listPageHealth, listPageSummaries } from '@/server/repositories/page.repo';
import { siteHealthPoints } from '@/server/scoring/score.util';
import { listStages } from '@/server/repositories/scan.repo';
import type { IAnswerSoFar, IScanStatus, IStageView, TLiveVerdict } from '@/types/interfaces/scan.interface';
import { formatDuration } from '@/utils/format.util';

export function stageTitle(scan: TScanRow, stages: TScanStageRow[]): string {
  if (scan.status === 'completed' || scan.status === 'partial') return 'Report ready';
  if (scan.status === 'failed') return 'Scan failed';
  const row = stages.find(s => s.stage === scan.current_stage);
  switch (scan.current_stage) {
    case 'crawl':
      return `Crawling ${scan.domain}`;
    case 'health':
      return 'Checking site health';
    case 'facts':
      return 'Building your fact sheet';
    case 'questions':
      return 'Writing 20 buyer questions';
    case 'engines':
      return `Asking ${ENGINE_LABELS[row?.meta.current_engine ?? scan.engines[0] ?? 'gemini']} your buyer questions`;
    case 'judge':
      return 'Judging answers';
    case 'report':
      return 'Scoring and writing fixes';
    default:
      return 'Queued';
  }
}

function stageMeta(row: TScanStageRow | undefined): string {
  if (!row) return '—';
  if (row.status === 'done') return formatDuration(row.duration_ms);
  if (row.status === 'skipped') return 'skipped';
  if (row.status === 'failed') return 'failed';
  if (row.status === 'running' && row.meta.total) return `${row.meta.done ?? 0} / ${row.meta.total}`;
  return '—';
}

export async function getScanStatusView(scan: TScanRow): Promise<IScanStatus> {
  const [stages, pagesCrawled, site, health, pageList, facts, questions, answers, judgments, claims] = await Promise.all([
    listStages(scan.id),
    countFetchedPages(scan.id),
    getSiteHealth(scan.id),
    listPageHealth(scan.id),
    listPageSummaries(scan.id),
    listFacts(scan.id),
    listQuestions(scan.id),
    listAnswers(scan.id),
    listJudgments(scan.id),
    listClaims(scan.id),
  ]);
  const byStage = new Map(stages.map(s => [s.stage, s]));
  const crawlDone = byStage.get('crawl')?.status === 'done';
  const engineLabels = scan.engines.map(e => ENGINE_LABELS[e]);

  const views: IStageView[] = STAGE_META.map(m => {
    const row = byStage.get(m.stage);
    let description = m.description;
    if (m.stage === 'crawl' && crawlDone && site) {
      description = `robots.txt, sitemap.xml, llms.txt${site.llms_txt_found ? '' : ' (missing)'}, ${pagesCrawled} routes classified.`;
    }
    if (m.stage === 'engines' && engineLabels.length) {
      description = `${engineLabels.join(', ')} with grounding, one pass.`;
    }
    return { stage: m.stage, order: m.order, title: m.title, description, status: row?.status ?? 'pending', meta: stageMeta(row) };
  });

  const doneCount = stages.filter(s => s.status === 'done' || s.status === 'skipped').length;
  const running = stages.find(s => s.status === 'running');
  const fraction = running?.meta.total ? (running.meta.done ?? 0) / running.meta.total : 0;
  const finished = scan.status === 'completed' || scan.status === 'partial';
  const progressPct = finished ? 100 : Math.min(99, Math.round(((doneCount + fraction) / STAGE_META.length) * 100));

  // Live answers: newest first, judged ones show their verdict.
  const qById = new Map(questions.map(q => [q.id, q]));
  const jByAnswer = new Map(judgments.map(j => [j.answer_id, j]));
  const wrongJudgments = new Set(claims.filter(c => c.verdict === 'wrong').map(c => c.judgment_id));
  const aliases = brandAliases(scan, facts);
  const answersSoFar: IAnswerSoFar[] = answers
    .filter(a => a.status === 'ok')
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
    .flatMap(a => {
      const q = qById.get(a.question_id);
      if (!q) return [];
      const j = jByAnswer.get(a.id);
      let verdict: TLiveVerdict;
      if (j) verdict = wrongJudgments.has(j.id) ? 'wrong_fact' : j.mentioned ? 'mentioned' : 'absent';
      else verdict = a.raw_text && mentionsBrand(a.raw_text, aliases) ? 'mentioned' : 'absent';
      return [{ id: a.id, intent: q.intent, question: q.text, engine: a.engine, verdict }];
    });

  const enginesRow = byStage.get('engines');
  const answersProgress =
    enginesRow?.status === 'running' && enginesRow.meta.total
      ? {
          done: enginesRow.meta.done ?? 0,
          total: enginesRow.meta.total,
          engineLabel: ENGINE_LABELS[enginesRow.meta.current_engine ?? scan.engines[0] ?? 'gemini'],
        }
      : null;

  const factsDone = byStage.get('facts')?.status === 'done';
  return {
    id: scan.id,
    domain: scan.domain,
    brandName: scan.brand_name,
    status: scan.status,
    currentStage: scan.current_stage,
    stageTitle: stageTitle(scan, stages),
    stageOrder: scan.current_stage ? STAGE_BY_KEY[scan.current_stage].order : 0,
    progressPct,
    startedAt: scan.started_at,
    completedAt: scan.completed_at,
    stages: views,
    factsReady: factsDone ? { count: facts.filter(f => f.value).length } : null,
    answersSoFar,
    answersProgress,
    early: {
      routesCrawled: crawlDone ? pagesCrawled : null,
      siteHealth:
        byStage.get('health')?.status === 'done' && site
          ? Math.round(
              siteHealthPoints(
                health
                  .filter(h => h.route_score !== null)
                  .map(h => ({ pageType: pageList.find(p => p.id === h.page_id)?.page_type ?? 'other', routeScore: Number(h.route_score) })),
                Number(site.site_score ?? 0),
              ),
            )
          : null,
      botsBlocked: site && crawlDone ? site.blocked_bots : null,
    },
    shareToken: scan.share_token,
    engines: scan.engines,
    error: scan.error,
  };
}
