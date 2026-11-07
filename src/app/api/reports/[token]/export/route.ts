import { z } from 'zod';

import { handleRoute } from '@/server/api-response.util';
import { EXPORT_SECTIONS, reportToCsv } from '@/server/csv/report-csv.util';
import { getReport } from '@/server/report-access.util';

export const dynamic = 'force-dynamic';

type TCtx = { params: Promise<{ token: string }> };

export const GET = handleRoute(async (req, { params }: TCtx) => {
  const { token } = await params;
  const section = z.enum(EXPORT_SECTIONS).catch('all').parse(new URL(req.url).searchParams.get('section'));
  const report = await getReport(token);
  const filename = `${report.domain}-aeo-${section}.csv`.replace(/[^a-z0-9.-]/gi, '_');
  return new Response(`﻿${reportToCsv(report, section)}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
});
