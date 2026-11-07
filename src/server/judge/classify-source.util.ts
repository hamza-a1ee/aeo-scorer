import 'server-only';

import type { TSourceClass } from '@/types/enums/answer.enum';

const FORUMS = /(^|\.)(reddit\.com|quora\.com|stackexchange\.com|stackoverflow\.com|news\.ycombinator\.com|indiehackers\.com|producthunt\.com|community\.|forum\.)/i;
const REVIEWS = /(^|\.)(g2\.com|capterra\.(com|co\.uk)|trustpilot\.com|trustradius\.com|getapp\.com|softwareadvice\.com|apps\.apple\.com|play\.google\.com|sourceforge\.net|gartner\.com)/i;
const ROUNDUP_PATH = /(best-|top-\d|top-|alternatives|-vs-|\/vs\/|comparison|review)/i;

/** Deterministic bucket for a cited URL. */
export function classifySource(
  url: string,
  ownHost: string,
  competitorNames: string[],
): TSourceClass {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return 'other';
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const own = ownHost.replace(/^www\./, '');
  if (host === own || host.endsWith(`.${own}`)) return 'your_site';
  const hostRoot = host.split('.').slice(-2, -1)[0] ?? host;
  if (
    competitorNames.some(n => {
      const slug = n.toLowerCase().replace(/[^a-z0-9]/g, '');
      return slug.length > 2 && (hostRoot === slug || host.startsWith(`${slug}.`));
    })
  ) {
    return 'competitor_sites';
  }
  if (FORUMS.test(host)) return 'reddit_forums';
  if (REVIEWS.test(host)) return 'review_sites';
  if (ROUNDUP_PATH.test(u.pathname)) return 'roundups';
  return 'other';
}

export function classifyCitations(
  urls: string[],
  ownHost: string,
  competitorNames: string[],
): Partial<Record<TSourceClass, number>> {
  const counts: Partial<Record<TSourceClass, number>> = {};
  for (const url of urls) {
    const k = classifySource(url, ownHost, competitorNames);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

/** Route of a citation on our own site, or null. */
export function ownRoute(url: string, ownHost: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const own = ownHost.replace(/^www\./, '');
    if (host !== own && !host.endsWith(`.${own}`)) return null;
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}
