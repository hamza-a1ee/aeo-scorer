import 'server-only';

import pLimit from 'p-limit';

import { canonicalCrawlUrl } from '@/server/crawler/discover-links.util';
import { extractPage } from '@/server/crawler/extract-page.util';
import { classifyRoute, PAGE_PRIORITY } from '@/server/crawler/classify-page.util';
import { createRateGate, fetchPage, fetchWithRetry } from '@/server/crawler/fetch-page.util';
import { loadRobots } from '@/server/crawler/robots.util';
import { loadSitemap } from '@/server/crawler/sitemap.util';
import { botAccessFor, countAllowed } from '@/server/health/bot-access.util';
import { daysSince, pickLastUpdated } from '@/server/health/freshness.util';
import { scoreRoute } from '@/server/health/route-health.util';
import { hasExpectedSchema, schemaTypes } from '@/server/health/schema-detect.util';
import { listPageSummaries, upsertPage, upsertPageHealth, upsertSiteHealth } from '@/server/repositories/page.repo';
import { toRoute } from '@/utils/url.util';

import type { IPipelineContext, IPipelineStage } from '../pipeline-context.type';

const PRICE_RE = /([$€£¥₹]\s?\d)|(\d+(?:[.,]\d+)?\s?(usd|eur|gbp|per month|\/mo|\/month|a month))/i;

interface IFrontierItem {
  url: string;
  priority: number;
  depth: number;
  lastmod: string | null;
}

/**
 * Stage 1: robots.txt, sitemap, llms.txt and up to MAX_PAGES same-site pages.
 * Per-page health signals are computed here too (they need the raw HTML).
 */
export const crawlStage: IPipelineStage = {
  key: 'crawl',
  async run(ctx: IPipelineContext) {
    const { scan, env, userAgent } = ctx;
    const host = new URL(scan.origin).hostname;
    const robots = await loadRobots(scan.origin, userAgent);
    const sitemap = await loadSitemap(scan.origin, robots.sitemaps, userAgent);

    let llmsTxt: string | null = null;
    try {
      const res = await fetchPage(`${scan.origin}/llms.txt`, {
        userAgent,
        accept: 'text/plain,text/markdown,*/*',
        maxBytes: 256 * 1024,
        sameSiteHost: host,
      });
      if (res.ok && !/html/i.test(res.contentType) && res.body.trim()) llmsTxt = res.body;
    } catch {
      llmsTxt = null;
    }

    const homeAccess = botAccessFor(`${scan.origin}/`, robots, null);
    await upsertSiteHealth({
      scan_id: scan.id,
      robots_found: robots.found,
      robots_txt: robots.text?.slice(0, 50_000) ?? null,
      site_bot_access: homeAccess,
      blocked_bots: Object.values(homeAccess).length - countAllowed(homeAccess),
      llms_txt_found: !!llmsTxt,
      llms_txt: llmsTxt?.slice(0, 50_000) ?? null,
      sitemap_found: sitemap.found,
      sitemap_urls: sitemap.entries.length,
    });

    // Frontier: home, then sitemap URLs by page priority and recency.
    const seen = new Set<string>();
    const frontier: IFrontierItem[] = [];
    const enqueue = (raw: string, depth: number, lastmod: string | null = null) => {
      const url = canonicalCrawlUrl(raw, host);
      if (!url || seen.has(url)) return;
      seen.add(url);
      frontier.push({ url, depth, lastmod, priority: PAGE_PRIORITY[classifyRoute(toRoute(url))] * 10 + depth });
    };
    enqueue(scan.input_url, 0);
    enqueue(`${scan.origin}/`, 0);
    for (const e of sitemap.entries) enqueue(e.loc, 1, e.lastmod);
    const sitemapLastmod = new Map(sitemap.entries.map(e => [canonicalCrawlUrl(e.loc, host), e.lastmod]));

    const already = await listPageSummaries(scan.id);
    const done = new Set(already.map(p => p.url));
    let fetched = already.filter(p => !p.fetch_error).length;

    const gate = createRateGate(300);
    const limit = pLimit(env.CRAWL_CONCURRENCY);
    let failuresInARow = 0;

    const next = () => {
      frontier.sort((a, b) => a.priority - b.priority || (b.lastmod ?? '').localeCompare(a.lastmod ?? ''));
      return frontier.shift();
    };

    while (fetched < env.MAX_PAGES && frontier.length && failuresInARow < 15) {
      const batch: IFrontierItem[] = [];
      while (batch.length < env.CRAWL_CONCURRENCY && frontier.length) {
        const item = next()!;
        if (!done.has(item.url)) batch.push(item);
      }
      if (!batch.length) break;

      await Promise.all(
        batch.map(item =>
          limit(async () => {
            if (fetched >= env.MAX_PAGES) return;
            done.add(item.url);
            const route = toRoute(item.url);
            const pageType = classifyRoute(route);
            const base = {
              scan_id: scan.id,
              url: item.url,
              route,
              page_type: pageType,
              sitemap_lastmod: sitemapLastmod.get(item.url) ?? null,
              fetched_at: new Date().toISOString(),
            };

            if (!robots.isAllowed(item.url, userAgent)) {
              await upsertPage({ ...emptyPage(base), fetch_error: 'Disallowed by robots.txt for our crawler' });
              return;
            }

            await gate();
            let res;
            try {
              res = await fetchWithRetry(item.url, { userAgent, sameSiteHost: host });
            } catch (error) {
              failuresInARow++;
              await upsertPage({ ...emptyPage(base), fetch_error: error instanceof Error ? error.message.slice(0, 300) : 'Fetch failed' });
              return;
            }
            if (!/html/i.test(res.contentType)) return;
            if (!res.ok) {
              failuresInARow++;
              await upsertPage({ ...emptyPage(base), http_status: res.status, fetch_error: `HTTP ${res.status}` });
              return;
            }
            failuresInARow = 0;

            const finalUrl = canonicalCrawlUrl(res.finalUrl, host) ?? item.url;
            if (finalUrl !== item.url && done.has(finalUrl)) return;
            done.add(finalUrl);
            const finalRoute = toRoute(finalUrl);
            const finalType = classifyRoute(finalRoute);

            const page = extractPage(res.body, finalUrl);
            const headerLastModified = res.headers.get('last-modified');
            const saved = await upsertPage({
              ...base,
              url: finalUrl,
              route: finalRoute,
              page_type: finalType,
              http_status: res.status,
              title: page.title,
              meta_description: page.metaDescription,
              canonical: page.canonical,
              text_content: page.textContent,
              main_text: page.mainText,
              word_count: page.wordCount,
              html_bytes: res.bytes,
              headings: page.headings,
              jsonld: page.jsonld,
              header_last_modified: headerLastModified ? safeIso(headerLastModified) : null,
              fetch_error: null,
            });
            fetched++;

            const access = botAccessFor(finalUrl, robots, page.metaRobots);
            const types = schemaTypes(page.jsonld, page.microdataTypes);
            const expected = hasExpectedSchema(finalType, types);
            const lastUpdated = pickLastUpdated(page.dates, base.sitemap_lastmod, saved.header_last_modified);
            const freshness = lastUpdated ? daysSince(lastUpdated) : null;
            const textRatio = res.bytes ? Math.min(1, Buffer.byteLength(page.textContent) / res.bytes) : 0;
            const health = scoreRoute({
              pageType: finalType,
              httpStatus: res.status,
              wordCount: page.wordCount,
              h1Count: page.h1Count,
              jsShell: page.jsShell,
              textRatio,
              botAccess: access,
              schemaTypes: types,
              expectedSchemaOk: expected,
              freshnessDays: freshness,
              metaRobots: page.metaRobots,
              hasCanonical: !!page.canonical,
              priceInHtml: finalType === 'pricing' ? PRICE_RE.test(page.textContent) : null,
            });
            await upsertPageHealth([
              {
                page_id: saved.id,
                scan_id: scan.id,
                bot_access: access,
                bots_allowed: countAllowed(access),
                readable_without_js: health.readable,
                text_ratio: Math.round(textRatio * 10_000) / 10_000,
                schema_types: types,
                expected_schema_ok: expected,
                last_updated: lastUpdated ? lastUpdated.toISOString().slice(0, 10) : null,
                freshness_days: freshness,
                issues: health.issues,
                route_score: health.score,
              },
            ]);

            for (const link of page.links) enqueue(link, item.depth + 1);
            await ctx.progress({ done: fetched, total: env.MAX_PAGES });
          }),
        ),
      );
    }

    ctx.log(`crawled ${fetched} pages`);
    if (fetched === 0) {
      throw new Error('Could not fetch any page from this site. Check the URL, or whether the site blocks crawlers.');
    }
  },
};

function emptyPage(base: {
  scan_id: string;
  url: string;
  route: string;
  page_type: ReturnType<typeof classifyRoute>;
  sitemap_lastmod: string | null;
  fetched_at: string;
}) {
  return {
    ...base,
    http_status: null,
    title: null,
    meta_description: null,
    canonical: null,
    text_content: null,
    main_text: null,
    word_count: null,
    html_bytes: null,
    headings: [],
    jsonld: [],
    header_last_modified: null,
    fetch_error: null as string | null,
  };
}

function safeIso(value: string): string | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
