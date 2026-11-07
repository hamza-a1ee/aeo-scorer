import 'server-only';

import { isSupabaseConfigured } from '@/lib/supabase/server-client';
import { listStaleRunning } from '@/server/repositories/scan.repo';

import { startPipeline } from './orchestrator';

/** Picks up scans whose worker died (no heartbeat for 3 minutes). */
export async function resumeStaleScans() {
  if (!isSupabaseConfigured()) return;
  try {
    const cutoff = new Date(Date.now() - 3 * 60_000).toISOString();
    const stale = await listStaleRunning(cutoff);
    for (const scan of stale) {
      console.log(`[pipeline] resuming scan ${scan.id} (${scan.domain})`);
      void startPipeline(scan.id);
    }
  } catch (error) {
    console.error('[pipeline] resume failed', error);
  }
}
