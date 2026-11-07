import 'server-only';

import { SAMPLE_FIXES, SAMPLE_REPORT } from '@/constants/sample-report.constant';
import type { TFixRow, TScanRow, TScoreRow } from '@/lib/supabase/rows.type';
import { buildReport } from '@/server/presenters/report.presenter';
import { listAnswers, listJudgments, listQuestions } from '@/server/repositories/answer.repo';
import { countScores, getLatestScore, listFixes } from '@/server/repositories/score.repo';
import { loadScanData } from '@/server/scoring/score-input.util';
import type { IReport } from '@/types/interfaces/report.interface';

import { isSample, scanByTokenOr404 } from './access.util';
import { HttpError } from './http-error';

/** Scan + latest score for a share token, or 409 while the scan is still running. */
export async function readyScan(token: string): Promise<{ scan: TScanRow; score: TScoreRow }> {
  const scan = await scanByTokenOr404(token);
  if (scan.status === 'queued' || scan.status === 'running') {
    throw new HttpError(409, 'The report is not ready yet');
  }
  const score = await getLatestScore(scan.id);
  if (!score) {
    throw new HttpError(422, scan.error ? `This scan failed: ${scan.error}` : 'This scan has no report');
  }
  return { scan, score };
}

export async function getReport(token: string): Promise<IReport> {
  if (isSample(token)) return SAMPLE_REPORT;
  const { scan, score } = await readyScan(token);
  const [data, fixes, count] = await Promise.all([
    loadScanData(scan.id),
    listFixes(scan.id, score.version),
    countScores(scan.id),
  ]);
  return buildReport(token, data, score, fixes, count);
}

export async function fixLookup(scanId: string) {
  const [questions, answers, judgments] = await Promise.all([
    listQuestions(scanId),
    listAnswers(scanId),
    listJudgments(scanId),
  ]);
  return { questions, answers, judgments };
}

export async function fixOr404(token: string, fixId: number): Promise<{ scan: TScanRow; fix: TFixRow }> {
  const { scan, score } = await readyScan(token);
  const fix = (await listFixes(scan.id, score.version)).find(f => f.id === fixId);
  if (!fix) throw new HttpError(404, 'Fix not found');
  return { scan, fix };
}

export function sampleFixOr404(fixId: number) {
  const fix = SAMPLE_FIXES.find(f => f.id === fixId);
  if (!fix) throw new HttpError(404, 'Fix not found');
  return fix;
}
