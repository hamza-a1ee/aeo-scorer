import 'server-only';

const SKIP_EXT = /\.(pdf|png|jpe?g|gif|webp|svg|ico|zip|gz|mp4|mp3|mov|webm|xml|json|js|css|txt|woff2?|ttf|csv|xlsx?|docx?)$/i;
const SKIP_PATH = /^\/(login|log-in|signin|sign-in|signup|sign-up|register|logout|cart|checkout|account|dashboard|app|admin|wp-admin|cdn-cgi)(\/|$)/i;

const sameSite = (a: string, b: string) =>
  a.replace(/^www\./, '') === b.replace(/^www\./, '');

/** Canonical crawl key: same-site, no hash/query, no trailing slash. */
export function canonicalCrawlUrl(raw: string, siteHost: string): string | null {
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    if (!sameSite(u.hostname.toLowerCase(), siteHost)) return null;
    if (SKIP_EXT.test(u.pathname) || SKIP_PATH.test(u.pathname)) return null;
    u.hash = '';
    u.search = '';
    u.hostname = u.hostname.toLowerCase();
    let path = u.pathname.replace(/\/{2,}/g, '/');
    if (path.length > 1) path = path.replace(/\/+$/, '');
    u.pathname = path;
    return u.toString().replace(/\/$/, path === '/' ? '/' : '');
  } catch {
    return null;
  }
}
