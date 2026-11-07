import 'server-only';

import { getSupabase, unwrap } from '@/lib/supabase/server-client';
import type {
  TPageHealthRow,
  TPageRow,
  TSiteHealthRow,
} from '@/lib/supabase/rows.type';

export type TPageInsert = Omit<TPageRow, 'id'>;

export async function upsertPage(page: TPageInsert): Promise<TPageRow> {
  return unwrap<TPageRow>(
    await getSupabase()
      .from('pages')
      .upsert(page, { onConflict: 'scan_id,url' })
      .select('*')
      .single(),
  );
}

/** Light listing without page text. */
export async function listPageSummaries(scanId: string) {
  return unwrap<
    Pick<
      TPageRow,
      'id' | 'url' | 'route' | 'page_type' | 'http_status' | 'word_count' | 'fetch_error' | 'title'
    >[]
  >(
    await getSupabase()
      .from('pages')
      .select('id,url,route,page_type,http_status,word_count,fetch_error,title')
      .eq('scan_id', scanId)
      .order('id'),
  );
}

export async function listPages(scanId: string): Promise<TPageRow[]> {
  return unwrap<TPageRow[]>(
    await getSupabase().from('pages').select('*').eq('scan_id', scanId).order('id'),
  );
}

export async function countFetchedPages(scanId: string): Promise<number> {
  const res = await getSupabase()
    .from('pages')
    .select('id', { count: 'exact', head: true })
    .eq('scan_id', scanId)
    .is('fetch_error', null);
  if (res.error) throw new Error(res.error.message);
  return res.count ?? 0;
}

export async function upsertPageHealth(rows: Omit<TPageHealthRow, 'id'>[]) {
  if (!rows.length) return;
  unwrap(
    await getSupabase().from('page_health').upsert(rows, { onConflict: 'page_id' }),
  );
}

export async function listPageHealth(scanId: string): Promise<TPageHealthRow[]> {
  return unwrap<TPageHealthRow[]>(
    await getSupabase().from('page_health').select('*').eq('scan_id', scanId),
  );
}

export async function upsertSiteHealth(row: Partial<TSiteHealthRow> & { scan_id: string }) {
  unwrap(
    await getSupabase().from('site_health').upsert(row, { onConflict: 'scan_id' }),
  );
}

export async function getSiteHealth(scanId: string): Promise<TSiteHealthRow | null> {
  return unwrap<TSiteHealthRow | null>(
    await getSupabase().from('site_health').select('*').eq('scan_id', scanId).maybeSingle(),
  );
}
