import 'server-only';

import pLimit from 'p-limit';

import { getEngines } from '@/lib/ai/engine-registry';
import { getCrawlerUserAgent, getEnv } from '@/lib/env';
import { SCAN_STAGES, type TScanStage } from '@/types/enums/scan.enum';
import {
  getScan,
  heartbeat,
  listStages,
  updateScan,
  updateStage,
} from '@/server/repositories/scan.repo';

import type { IPipelineContext } from './pipeline-context.type';
import { STAGE_REGISTRY } from './stage-registry';

const running = new Set<string>();
let limiter: ReturnType<typeof pLimit> | null = null;

interface IRunOptions {
  /** Start from this stage. */
  from?: TScanStage;
  /** Re-run stages already marked done (from `from` onward). */
  force?: boolean;
}

/** Runs a scan in the background, at most once per scan and MAX_CONCURRENT_SCANS at a time. */
export function startPipeline(scanId: string, opts: IRunOptions = {}): Promise<void> {
  if (running.has(scanId)) return Promise.resolve();
  running.add(scanId);
  limiter ??= pLimit(getEnv().MAX_CONCURRENT_SCANS);
  return limiter(() => runPipeline(scanId, opts))
    .catch(error => console.error(`[pipeline ${scanId}]`, error))
    .finally(() => running.delete(scanId));
}

export function isPipelineRunning(scanId: string) {
  return running.has(scanId);
}

async function runPipeline(scanId: string, opts: IRunOptions) {
  let scan = await getScan(scanId);
  if (!scan) return;
  const env = getEnv();
  const fromIndex = opts.from ? SCAN_STAGES.indexOf(opts.from) : 0;

  await heartbeat(scanId, {
    status: 'running',
    started_at: scan.started_at ?? new Date().toISOString(),
    completed_at: null,
    error: null,
  });

  const ctx: IPipelineContext = {
    scan,
    env,
    engines: getEngines(scan.engines),
    userAgent: getCrawlerUserAgent(),
    refresh: async () => {
      scan = (await getScan(scanId)) ?? scan!;
      ctx.scan = scan;
      return scan;
    },
    progress: async meta => {
      await Promise.all([
        updateStage(scanId, currentStage!, { meta }),
        heartbeat(scanId),
      ]);
    },
    shouldStop: async () => (await ctx.refresh()).skip_requested,
    log: message => console.log(`[pipeline ${scan!.domain}] ${message}`),
  };

  let currentStage: TScanStage | null = null;
  const stages = await listStages(scanId);

  for (const [index, key] of SCAN_STAGES.entries()) {
    if (index < fromIndex) continue;
    const row = stages.find(s => s.stage === key);
    if (row && (row.status === 'done' || row.status === 'skipped') && !opts.force) continue;

    currentStage = key;
    const started = Date.now();
    await updateStage(scanId, key, {
      status: 'running',
      started_at: new Date(started).toISOString(),
      finished_at: null,
      error: null,
    });
    await heartbeat(scanId, { current_stage: key });
    ctx.log(`stage ${key} started`);

    try {
      await STAGE_REGISTRY[key].run(ctx);
      await updateStage(scanId, key, {
        status: 'done',
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
      });
      ctx.log(`stage ${key} done in ${Date.now() - started} ms`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[pipeline ${scanId}] stage ${key} failed`, error);
      await updateStage(scanId, key, {
        status: 'failed',
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
        error: message.slice(0, 1000),
      });
      await updateScan(scanId, { status: 'failed', error: `${key}: ${message}`.slice(0, 1000) });
      return;
    }
  }

  // A resumed run can find every stage done; never leave the scan "running".
  const final = await getScan(scanId);
  if (final?.status === 'running' || final?.status === 'queued') {
    await updateScan(scanId, { status: 'completed', completed_at: new Date().toISOString() });
  }
}
