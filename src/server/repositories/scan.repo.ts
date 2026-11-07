import 'server-only';

import { getSupabase, unwrap } from '@/lib/supabase/server-client';
import type { TScanRow, TScanStageRow } from '@/lib/supabase/rows.type';
import { STAGE_META } from '@/constants/stages.constant';
import type { TEngine } from '@/types/enums/answer.enum';
import type { TScanStage } from '@/types/enums/scan.enum';

export async function insertScan(input: {
  inputUrl: string;
  origin: string;
  domain: string;
  shareToken: string;
  engines: TEngine[];
}): Promise<TScanRow> {
  const scan = unwrap<TScanRow>(
    await getSupabase()
      .from('scans')
      .insert({
        input_url: input.inputUrl,
        origin: input.origin,
        domain: input.domain,
        share_token: input.shareToken,
        engines: input.engines,
        status: 'queued',
      })
      .select('*')
      .single(),
  );
  unwrap(
    await getSupabase()
      .from('scan_stages')
      .insert(
        STAGE_META.map(s => ({
          scan_id: scan.id,
          stage: s.stage,
          stage_order: s.order,
          status: 'pending',
        })),
      ),
  );
  return scan;
}

export async function findTodayScan(domain: string): Promise<TScanRow | null> {
  const today = new Date().toISOString().slice(0, 10);
  return unwrap<TScanRow | null>(
    await getSupabase()
      .from('scans')
      .select('*')
      .eq('domain', domain)
      .eq('scan_date', today)
      .maybeSingle(),
  );
}

export async function getScan(id: string): Promise<TScanRow | null> {
  return unwrap<TScanRow | null>(
    await getSupabase().from('scans').select('*').eq('id', id).maybeSingle(),
  );
}

export async function getScanByToken(token: string): Promise<TScanRow | null> {
  return unwrap<TScanRow | null>(
    await getSupabase()
      .from('scans')
      .select('*')
      .eq('share_token', token)
      .maybeSingle(),
  );
}

export async function updateScan(id: string, patch: Partial<TScanRow>) {
  unwrap(await getSupabase().from('scans').update(patch).eq('id', id));
}

export async function heartbeat(id: string, patch: Partial<TScanRow> = {}) {
  await updateScan(id, { ...patch, heartbeat_at: new Date().toISOString() });
}

export async function bumpFactSheetVersion(scan: TScanRow): Promise<number> {
  const next = scan.fact_sheet_version + 1;
  await updateScan(scan.id, { fact_sheet_version: next });
  return next;
}

export async function listStaleRunning(olderThanIso: string): Promise<TScanRow[]> {
  return unwrap<TScanRow[]>(
    await getSupabase()
      .from('scans')
      .select('*')
      .in('status', ['running', 'queued'])
      .or(`heartbeat_at.is.null,heartbeat_at.lt.${olderThanIso}`),
  );
}

export async function listStages(scanId: string): Promise<TScanStageRow[]> {
  return unwrap<TScanStageRow[]>(
    await getSupabase()
      .from('scan_stages')
      .select('*')
      .eq('scan_id', scanId)
      .order('stage_order'),
  );
}

export async function updateStage(
  scanId: string,
  stage: TScanStage,
  patch: Partial<TScanStageRow>,
) {
  unwrap(
    await getSupabase()
      .from('scan_stages')
      .update(patch)
      .eq('scan_id', scanId)
      .eq('stage', stage),
  );
}

export async function resetStages(scanId: string, stages: TScanStage[]) {
  unwrap(
    await getSupabase()
      .from('scan_stages')
      .update({
        status: 'pending',
        started_at: null,
        finished_at: null,
        duration_ms: null,
        meta: {},
        error: null,
      })
      .eq('scan_id', scanId)
      .in('stage', stages),
  );
}
