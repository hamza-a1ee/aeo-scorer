export interface INormalizedUrl {
  url: string;
  origin: string;
  host: string;
  /** apex host without "www.", used for the one-scan-per-day limit */
  domain: string;
}

/** Accepts "tallybook.app" or a full URL and returns its https origin parts. */
export function normalizeInputUrl(input: string): INormalizedUrl {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs can be scanned');
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.')) throw new Error('Enter a public website address');
  const origin = `${parsed.protocol}//${host}${parsed.port ? `:${parsed.port}` : ''}`;
  return {
    url: `${origin}${parsed.pathname === '/' ? '' : parsed.pathname}`,
    origin,
    host,
    domain: host.replace(/^www\./, ''),
  };
}

export function isValidInputUrl(input: string): boolean {
  try {
    normalizeInputUrl(input);
    return true;
  } catch {
    return false;
  }
}

/** Strip origin, query and hash: "https://x.com/pricing?a=1" → "/pricing" */
export function toRoute(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return url;
  }
}
