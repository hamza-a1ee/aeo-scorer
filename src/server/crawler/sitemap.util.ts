import 'server-only';

import { XMLParser } from 'fast-xml-parser';

import { fetchPage } from './fetch-page.util';

export interface ISitemapEntry {
  loc: string;
  lastmod: string | null;
}

const parser = new XMLParser({ ignoreAttributes: true });
const asArray = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

async function fetchXml(url: string, userAgent: string, host: string) {
  try {
    const res = await fetchPage(url, {
      userAgent,
      accept: 'application/xml,text/xml,*/*',
      maxBytes: 5 * 1024 * 1024,
      sameSiteHost: host,
    });
    if (!res.ok || !/<(urlset|sitemapindex)/i.test(res.body)) return null;
    return parser.parse(res.body) as {
      urlset?: { url?: { loc?: string; lastmod?: string } | { loc?: string; lastmod?: string }[] };
      sitemapindex?: { sitemap?: { loc?: string } | { loc?: string }[] };
    };
  } catch {
    return null;
  }
}

/** Reads robots-declared sitemaps (or /sitemap.xml), one level of index, capped. */
export async function loadSitemap(
  origin: string,
  declared: string[],
  userAgent: string,
  cap = 500,
): Promise<{ found: boolean; entries: ISitemapEntry[] }> {
  const host = new URL(origin).hostname;
  const roots = declared.length ? declared.slice(0, 3) : [`${origin}/sitemap.xml`];
  const entries: ISitemapEntry[] = [];
  let found = false;

  const queue = [...roots];
  let fetched = 0;
  while (queue.length && entries.length < cap && fetched < 6) {
    const url = queue.shift()!;
    fetched++;
    const doc = await fetchXml(url, userAgent, host);
    if (!doc) continue;
    found = true;
    for (const s of asArray(doc.sitemapindex?.sitemap)) {
      if (s.loc) queue.push(String(s.loc));
    }
    for (const u of asArray(doc.urlset?.url)) {
      if (u.loc) entries.push({ loc: String(u.loc).trim(), lastmod: u.lastmod ? String(u.lastmod) : null });
      if (entries.length >= cap) break;
    }
  }
  return { found, entries };
}
