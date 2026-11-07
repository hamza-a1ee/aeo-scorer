import 'server-only';

import { getSupabase, unwrap } from '@/lib/supabase/server-client';
import type {
  TAnswerRow,
  TClaimRow,
  TJudgmentRow,
  TQuestionRow,
} from '@/lib/supabase/rows.type';
import type { TEngine } from '@/types/enums/answer.enum';

export async function listQuestions(scanId: string): Promise<TQuestionRow[]> {
  return unwrap<TQuestionRow[]>(
    await getSupabase()
      .from('questions')
      .select('*')
      .eq('scan_id', scanId)
      .order('sort_order'),
  );
}

export async function replaceQuestions(
  scanId: string,
  rows: Omit<TQuestionRow, 'id' | 'scan_id'>[],
): Promise<TQuestionRow[]> {
  unwrap(await getSupabase().from('questions').delete().eq('scan_id', scanId));
  return unwrap<TQuestionRow[]>(
    await getSupabase()
      .from('questions')
      .insert(rows.map(r => ({ ...r, scan_id: scanId })))
      .select('*'),
  );
}

export async function listAnswers(scanId: string): Promise<TAnswerRow[]> {
  return unwrap<TAnswerRow[]>(
    await getSupabase()
      .from('answers')
      .select('*')
      .eq('scan_id', scanId)
      .order('id'),
  );
}

export async function upsertAnswer(row: Omit<TAnswerRow, 'id' | 'created_at'>) {
  unwrap(
    await getSupabase()
      .from('answers')
      .upsert(row, { onConflict: 'question_id,engine' }),
  );
}

export async function listJudgments(scanId: string): Promise<TJudgmentRow[]> {
  return unwrap<TJudgmentRow[]>(
    await getSupabase().from('judgments').select('*').eq('scan_id', scanId),
  );
}

/** Replaces the judgment (and its claims) for one answer. */
export async function saveJudgment(
  row: Omit<TJudgmentRow, 'id'>,
  claims: Omit<TClaimRow, 'id' | 'judgment_id'>[],
) {
  const db = getSupabase();
  const saved = unwrap<TJudgmentRow>(
    await db
      .from('judgments')
      .upsert({ ...row, judged_at: new Date().toISOString() }, { onConflict: 'answer_id' })
      .select('*')
      .single(),
  );
  unwrap(await db.from('claims').delete().eq('judgment_id', saved.id));
  if (claims.length) {
    unwrap(
      await db
        .from('claims')
        .insert(claims.map(c => ({ ...c, judgment_id: saved.id }))),
    );
  }
  return saved;
}

export async function listClaims(scanId: string): Promise<TClaimRow[]> {
  return unwrap<TClaimRow[]>(
    await getSupabase().from('claims').select('*').eq('scan_id', scanId),
  );
}

export async function countAnswers(scanId: string, engine?: TEngine) {
  let q = getSupabase()
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('scan_id', scanId);
  if (engine) q = q.eq('engine', engine);
  const res = await q;
  if (res.error) throw new Error(res.error.message);
  return res.count ?? 0;
}
