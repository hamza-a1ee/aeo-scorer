import 'server-only';

import * as cheerio from 'cheerio';

import type { THeading } from '@/lib/supabase/rows.type';

export interface IExtractedPage {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  metaRobots: string | null;
  headings: THeading[];
  h1Count: number;
  jsonld: unknown[];
  jsonldInvalid: number;
  microdataTypes: string[];
  textContent: string;
  mainText: string;
  wordCount: number;
  links: string[];
  dates: { jsonldModified: string | null; metaModified: string | null; timeTag: string | null; visible: string | null };
  jsShell: boolean;
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const words = (s: string) => (s ? s.split(' ').filter(Boolean).length : 0);

function findJsonldDate(items: unknown[]): string | null {
  for (const item of items) {
    const stack: unknown[] = [item];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== 'object') continue;
      const obj = node as Record<string, unknown>;
      if (typeof obj.dateModified === 'string') return obj.dateModified;
      for (const v of Object.values(obj)) if (v && typeof v === 'object') stack.push(v);
    }
  }
  return null;
}

const VISIBLE_DATE_RE =
  /(?:last updated|updated on|updated|last modified)\s*[:\-–]?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2},? \d{4}|\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]* \d{4}|\d{4}-\d{2}-\d{2})/i;

export function extractPage(html: string, pageUrl: string): IExtractedPage {
  const $ = cheerio.load(html);

  const jsonld: unknown[] = [];
  let jsonldInvalid = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) jsonld.push(...parsed);
      else jsonld.push(parsed);
    } catch {
      jsonldInvalid++;
    }
  });

  const microdataTypes = $('[itemtype]')
    .map((_, el) => ($(el).attr('itemtype') ?? '').split('/').pop() ?? '')
    .get()
    .filter(Boolean);

  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    try {
      links.add(new URL(href, pageUrl).toString());
    } catch {
      /* ignore bad hrefs */
    }
  });

  const headings: THeading[] = [];
  $('h1, h2, h3').each((_, el) => {
    if (headings.length >= 40) return;
    const text = squash($(el).text());
    if (text) headings.push({ level: Number(el.tagName.slice(1)), text: text.slice(0, 200) });
  });

  const dates = {
    jsonldModified: findJsonldDate(jsonld),
    metaModified:
      $('meta[property="article:modified_time"]').attr('content') ??
      $('meta[property="og:updated_time"]').attr('content') ??
      null,
    timeTag: $('time[datetime]').first().attr('datetime') ?? null,
    visible: null as string | null,
  };

  const shellRoot = ['#__next', '#root', '#app', '#___gatsby']
    .map(sel => $(sel))
    .find(n => n.length > 0);
  const noscriptJs = /enable javascript|requires javascript|javascript is required/i.test($('noscript').text());

  $('script, style, noscript, svg, template, iframe, canvas').remove();

  const textContent = squash($('body').text());
  const mainNode = $('main, article, [role="main"]').first();
  let mainText: string;
  if (mainNode.length) {
    mainText = squash(mainNode.text());
  } else {
    const body = $('body').clone();
    body.find('nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    mainText = squash(body.text());
  }
  if (words(mainText) < 40) mainText = textContent;

  dates.visible = VISIBLE_DATE_RE.exec(textContent)?.[1] ?? null;

  const wordCount = words(textContent);
  const jsShell =
    wordCount < 60 && ((shellRoot !== undefined && squash(shellRoot.text()).length < 40) || noscriptJs);

  return {
    title: squash($('title').first().text()) || null,
    metaDescription: $('meta[name="description"]').attr('content')?.trim() || null,
    canonical: $('link[rel="canonical"]').attr('href') ?? null,
    metaRobots: $('meta[name="robots"]').attr('content')?.toLowerCase() ?? null,
    headings,
    h1Count: headings.filter(h => h.level === 1).length,
    jsonld,
    jsonldInvalid,
    microdataTypes,
    textContent: textContent.slice(0, 60_000),
    mainText: mainText.slice(0, 40_000),
    wordCount,
    links: [...links],
    dates,
    jsShell,
  };
}
