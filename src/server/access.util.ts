import 'server-only';

import { SAMPLE_ID } from '@/constants/app-routes.constant';
import type { TScanRow } from '@/lib/supabase/rows.type';
import { getScan, getScanByToken } from '@/server/repositories/scan.repo';

import { assertUuid } from './api-response.util';
import { HttpError } from './http-error';

export const isSample = (idOrToken: string) => idOrToken === SAMPLE_ID;

export function assertWritable(idOrToken: string) {
  if (isSample(idOrToken)) {
    throw new HttpError(403, 'The sample report is read-only. Scan your own site to edit it.');
  }
}

export async function scanOr404(id: string): Promise<TScanRow> {
  const scan = await getScan(assertUuid(id));
  if (!scan) throw new HttpError(404, 'Scan not found');
  return scan;
}

export async function scanByTokenOr404(token: string): Promise<TScanRow> {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) throw new HttpError(404, 'Report not found');
  const scan = await getScanByToken(token);
  if (!scan) throw new HttpError(404, 'Report not found');
  return scan;
}
