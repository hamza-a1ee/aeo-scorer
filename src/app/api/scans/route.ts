import { nanoid } from 'nanoid';
import { after } from 'next/server';

import { getConfiguredEngines } from '@/lib/ai/engine-registry';
import { getEnv } from '@/lib/env';
import { scanInputSchema } from '@/schema/scan-input.schema';
import { handleRoute, ok } from '@/server/api-response.util';
import { isPublicHost } from '@/server/crawler/fetch-page.util';
import { HttpError } from '@/server/http-error';
import { startPipeline } from '@/server/pipeline/orchestrator';
import { findTodayScan, insertScan } from '@/server/repositories/scan.repo';
import type { ICreateScanResponse } from '@/types/interfaces/scan.interface';
import { normalizeInputUrl } from '@/utils/url.util';

export const POST = handleRoute(async req => {
  const { url } = scanInputSchema.parse(await req.json());
  const target = normalizeInputUrl(url);

  if (!(await isPublicHost(target.host))) {
    throw new HttpError(400, 'That address is not a public website');
  }
  if (!getEnv().GEMINI_API_KEY) {
    throw new HttpError(503, 'Scanning needs GEMINI_API_KEY in .env. Try the sample report meanwhile.');
  }
  const engines = getConfiguredEngines().map(e => e.id);

  // One scan per domain per day: return today's scan if it exists.
  const existing = await findTodayScan(target.domain);
  if (existing) {
    return ok<ICreateScanResponse>({ scanId: existing.id, shareToken: existing.share_token, status: existing.status, existing: true }, 'Already scanned today');
  }

  let scan;
  try {
    scan = await insertScan({ inputUrl: target.url, origin: target.origin, domain: target.domain, shareToken: nanoid(12), engines });
  } catch (error) {
    // Lost a race with a parallel request for the same domain.
    if ((error as { code?: string }).code === '23505') {
      const raced = await findTodayScan(target.domain);
      if (raced) {
        return ok<ICreateScanResponse>({ scanId: raced.id, shareToken: raced.share_token, status: raced.status, existing: true }, 'Already scanned today');
      }
    }
    throw error;
  }

  after(() => startPipeline(scan.id));
  return ok<ICreateScanResponse>({ scanId: scan.id, shareToken: scan.share_token, status: scan.status, existing: false }, 'Scan started', 201);
});
