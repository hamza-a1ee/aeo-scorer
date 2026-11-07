import 'server-only';

import { getSupabase, unwrap } from '@/lib/supabase/server-client';
import type { TFixRow, TScoreRow } from '@/lib/supabase/rows.type';

export async function getLatestScore(scanId: string): Promise<TScoreRow | null> {
  return unwrap<TScoreRow | null>(
    await getSupabase()
      .from('scores')
      .select('*')
      .eq('scan_id', scanId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function insertScore(row: Omit<TScoreRow, 'id' | 'computed_at'>): Promise<TScoreRow> {
  return unwrap<TScoreRow>(
    await getSupabase().from('scores').insert(row).select('*').single(),
  );
}

export async function countScores(scanId: string): Promise<number> {
  const res = await getSupabase()
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .eq('scan_id', scanId);
  if (res.error) throw new Error(res.error.message);
  return res.count ?? 0;
}

export async function insertFixes(rows: Omit<TFixRow, 'id'>[]): Promise<TFixRow[]> {
  if (!rows.length) return [];
  return unwrap<TFixRow[]>(
    await getSupabase()
      .from('fixes')
      .upsert(rows, { onConflict: 'scan_id,score_version,fix_type,route' })
      .select('*'),
  );
}

export async function listFixes(scanId: string, scoreVersion: number): Promise<TFixRow[]> {
  return unwrap<TFixRow[]>(
    await getSupabase()
      .from('fixes')
      .select('*')
      .eq('scan_id', scanId)
      .eq('score_version', scoreVersion)
      .order('rank'),
  );
}

export async function getFix(scanId: string, fixId: number): Promise<TFixRow | null> {
  return unwrap<TFixRow | null>(
    await getSupabase()
      .from('fixes')
      .select('*')
      .eq('scan_id', scanId)
      .eq('id', fixId)
      .maybeSingle(),
  );
}

export async function updateFix(fixId: number, patch: Partial<TFixRow>): Promise<TFixRow> {
  return unwrap<TFixRow>(
    await getSupabase().from('fixes').update(patch).eq('id', fixId).select('*').single(),
  );
}
