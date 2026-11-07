import 'server-only';

import robotsParser from 'robots-parser';

import { fetchPage } from './fetch-page.util';

export interface IRobots {
  found: boolean;
  text: string | null;
  isAllowed(url: string, userAgent: string): boolean;
  sitemaps: string[];
}

export async function loadRobots(origin: string, userAgent: string): Promise<IRobots> {
  const robotsUrl = `${origin}/robots.txt`;
  let text: string | null = null;
  try {
    const res = await fetchPage(robotsUrl, {
      userAgent,
      accept: 'text/plain,*/*',
      maxBytes: 512 * 1024,
      sameSiteHost: new URL(origin).hostname,
    });
    if (res.ok && !/html/i.test(res.contentType)) text = res.body;
  } catch {
    text = null;
  }
  const parser = robotsParser(robotsUrl, text ?? '');
  return {
    found: text !== null,
    text,
    // robots-parser returns undefined for other origins; treat as allowed.
    isAllowed: (url, ua) => parser.isAllowed(url, ua) !== false,
    sitemaps: parser.getSitemaps(),
  };
}

/** Finds the robots.txt line that blocks a bot at "/", e.g. "robots.txt:14". */
export function findBlockingLine(robotsText: string | null, bot: string): { line: number; text: string } | null {
  if (!robotsText) return null;
  const lines = robotsText.split(/\r?\n/);
  let inGroup = false;
  let groupStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/#.*/, '').trim();
    if (!raw) continue;
    const [k, ...rest] = raw.split(':');
    const key = k.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      const matches = value === '*' ? false : value.toLowerCase() === bot.toLowerCase();
      if (matches) {
        inGroup = true;
        groupStart = i;
      } else if (inGroup && i !== groupStart + 1) {
        inGroup = false;
      }
    } else if (inGroup && key === 'disallow' && value === '/') {
      return { line: i + 1, text: `User-agent: ${bot} / Disallow: /` };
    }
  }
  return null;
}
