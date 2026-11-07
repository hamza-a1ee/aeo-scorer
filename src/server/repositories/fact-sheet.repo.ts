import 'server-only';

import { getSupabase, unwrap } from '@/lib/supabase/server-client';
import type {
  TCompetitorRow,
  TFactRow,
  TRatingRow,
} from '@/lib/supabase/rows.type';

export async function listFacts(scanId: string): Promise<TFactRow[]> {
  return unwrap<TFactRow[]>(
    await getSupabase()
      .from('facts')
      .select('*')
      .eq('scan_id', scanId)
      .order('sort_order'),
  );
}

export async function upsertFacts(rows: Omit<TFactRow, 'id'>[]) {
  if (!rows.length) return;
  unwrap(
    await getSupabase().from('facts').upsert(rows, { onConflict: 'scan_id,key' }),
  );
}

export async function getFact(scanId: string, factId: number): Promise<TFactRow | null> {
  return unwrap<TFactRow | null>(
    await getSupabase()
      .from('facts')
      .select('*')
      .eq('scan_id', scanId)
      .eq('id', factId)
      .maybeSingle(),
  );
}

export async function updateFact(factId: number, patch: Partial<TFactRow>): Promise<TFactRow> {
  return unwrap<TFactRow>(
    await getSupabase().from('facts').update(patch).eq('id', factId).select('*').single(),
  );
}

export async function listCompetitors(scanId: string): Promise<TCompetitorRow[]> {
  return unwrap<TCompetitorRow[]>(
    await getSupabase()
      .from('competitors')
      .select('*')
      .eq('scan_id', scanId)
      .order('id'),
  );
}

/** Inserts competitors, ignoring names already present (case-insensitive). */
export async function addCompetitors(
  scanId: string,
  items: Omit<TCompetitorRow, 'id' | 'scan_id'>[],
): Promise<TCompetitorRow[]> {
  const existing = await listCompetitors(scanId);
  const seen = new Set(existing.map(c => c.name.toLowerCase()));
  const fresh = items.filter(i => {
    const k = i.name.trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (!fresh.length) return [];
  return unwrap<TCompetitorRow[]>(
    await getSupabase()
      .from('competitors')
      .insert(fresh.map(f => ({ ...f, name: f.name.trim(), scan_id: scanId })))
      .select('*'),
  );
}

export async function deleteCompetitor(scanId: string, id: number) {
  unwrap(
    await getSupabase().from('competitors').delete().eq('scan_id', scanId).eq('id', id),
  );
}

export async function listRatings(scanId: string): Promise<TRatingRow[]> {
  return unwrap<TRatingRow[]>(
    await getSupabase().from('ratings').select('*').eq('scan_id', scanId),
  );
}

export async function upsertRatings(rows: Omit<TRatingRow, 'id'>[]): Promise<TRatingRow[]> {
  if (!rows.length) return [];
  return unwrap<TRatingRow[]>(
    await getSupabase()
      .from('ratings')
      .upsert(rows, { onConflict: 'scan_id,platform' })
      .select('*'),
  );
}
