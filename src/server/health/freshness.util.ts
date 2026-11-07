import 'server-only';

import type { IExtractedPage } from '@/server/crawler/extract-page.util';

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() > Date.now() + 86_400_000 * 2) return null;
  if (d.getFullYear() < 2000) return null;
  return d;
}

/** Best "last updated" date, most trustworthy source first. */
export function pickLastUpdated(
  dates: IExtractedPage['dates'] | null,
  sitemapLastmod: string | null,
  headerLastModified: string | null,
): Date | null {
  return (
    parse(dates?.jsonldModified) ??
    parse(dates?.metaModified) ??
    parse(dates?.visible) ??
    parse(dates?.timeTag) ??
    parse(sitemapLastmod) ??
    parse(headerLastModified)
  );
}

export const daysSince = (d: Date) =>
  Math.floor((Date.now() - d.getTime()) / 86_400_000);
