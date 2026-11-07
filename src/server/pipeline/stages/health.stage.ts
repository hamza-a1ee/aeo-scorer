import 'server-only';

import { listPageHealth, listPageSummaries, getSiteHealth, upsertSiteHealth } from '@/server/repositories/page.repo';

import type { IPipelineStage } from '../pipeline-context.type';

/**
 * Stage 2: site-level health. Per-route checks were stored during the crawl;
 * here we add the site score (llms.txt 40, sitemap 30, all bots allowed 30).
 */
export const healthStage: IPipelineStage = {
  key: 'health',
  async run(ctx) {
    const site = await getSiteHealth(ctx.scan.id);
    const pages = await listPageSummaries(ctx.scan.id);
    const health = await listPageHealth(ctx.scan.id);
    const total = Object.keys(site?.site_bot_access ?? {}).length || 6;
    const allowed = total - (site?.blocked_bots ?? 0);

    const siteScore =
      (site?.llms_txt_found ? 40 : 0) +
      (site?.sitemap_found ? 30 : 0) +
      30 * (allowed / total);

    await upsertSiteHealth({ scan_id: ctx.scan.id, site_score: Math.round(siteScore * 100) / 100 });
    await ctx.progress({ done: health.length, total: pages.filter(p => !p.fetch_error).length });
  },
};
