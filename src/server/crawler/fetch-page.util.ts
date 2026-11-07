import 'server-only';

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export interface IFetchResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  contentType: string;
  headers: Headers;
  body: string;
  bytes: number;
}

interface IFetchOptions {
  userAgent: string;
  timeoutMs?: number;
  maxBytes?: number;
  accept?: string;
  maxRedirects?: number;
  /** Only follow redirects that stay on this registrable host. */
  sameSiteHost?: string;
}

const hostCache = new Map<string, Promise<boolean>>();

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')) return true;
    if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
    return false;
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

/** Blocks localhost, private networks and cloud metadata hosts (SSRF guard). */
export async function isPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    return false;
  }
  if (isIP(host)) return !isPrivateAddress(host);
  if (!hostCache.has(host)) {
    hostCache.set(
      host,
      lookup(host, { all: true })
        .then(addrs => addrs.length > 0 && addrs.every(a => !isPrivateAddress(a.address)))
        .catch(() => false),
    );
  }
  return hostCache.get(host)!;
}

const sameSite = (a: string, b: string) =>
  a.replace(/^www\./, '') === b.replace(/^www\./, '');

async function readCapped(res: Response, maxBytes: number): Promise<{ text: string; bytes: number }> {
  if (!res.body) return { text: '', bytes: 0 };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    chunks.push(value);
    if (bytes >= maxBytes) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  const buf = new Uint8Array(Math.min(bytes, maxBytes));
  let offset = 0;
  for (const c of chunks) {
    const slice = c.subarray(0, Math.min(c.byteLength, buf.byteLength - offset));
    buf.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= buf.byteLength) break;
  }
  return { text: new TextDecoder('utf-8', { fatal: false }).decode(buf), bytes };
}

/** Polite GET with timeout, size cap, manual same-site redirects and SSRF checks. */
export async function fetchPage(url: string, opts: IFetchOptions): Promise<IFetchResult> {
  const { userAgent, timeoutMs = 10_000, maxBytes = 2 * 1024 * 1024, accept = 'text/html,application/xhtml+xml', maxRedirects = 3 } = opts;
  let current = url;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const parsed = new URL(current);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
    if (!(await isPublicHost(parsed.hostname))) throw new Error('Host is not publicly reachable');
    if (opts.sameSiteHost && !sameSite(parsed.hostname, opts.sameSiteHost)) {
      throw new Error(`Redirected off-site to ${parsed.hostname}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': userAgent, Accept: accept, 'Accept-Language': 'en' },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        current = new URL(res.headers.get('location')!, current).toString();
        await res.body?.cancel().catch(() => undefined);
        continue;
      }
      const { text, bytes } = await readCapped(res, maxBytes);
      return {
        ok: res.ok,
        status: res.status,
        finalUrl: current,
        contentType: res.headers.get('content-type') ?? '',
        headers: res.headers,
        body: text,
        bytes,
      };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('Too many redirects');
}

/** One retry on network errors and 5xx. */
export async function fetchWithRetry(url: string, opts: IFetchOptions): Promise<IFetchResult> {
  try {
    const res = await fetchPage(url, opts);
    if (res.status >= 500) {
      await new Promise(r => setTimeout(r, 800));
      return fetchPage(url, opts);
    }
    return res;
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (/publicly reachable|off-site|protocol/.test(msg)) throw error;
    await new Promise(r => setTimeout(r, 800));
    return fetchPage(url, opts);
  }
}

/** Ensures requests start at least `gapMs` apart. */
export function createRateGate(gapMs: number) {
  let next = 0;
  return async () => {
    const now = Date.now();
    const wait = Math.max(0, next - now);
    next = Math.max(now, next) + gapMs;
    if (wait) await new Promise(r => setTimeout(r, wait));
  };
}
