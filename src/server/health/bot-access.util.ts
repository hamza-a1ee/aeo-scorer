import 'server-only';

import { AI_BOTS } from '@/constants/bots.constant';
import type { IRobots } from '@/server/crawler/robots.util';

export type TBotAccess = Record<string, 'allowed' | 'blocked'>;

export function botAccessFor(url: string, robots: IRobots, metaRobots: string | null): TBotAccess {
  const noai = !!metaRobots && /\b(noai|none)\b/.test(metaRobots);
  return Object.fromEntries(
    AI_BOTS.map(bot => [bot, !noai && robots.isAllowed(url, bot) ? 'allowed' : 'blocked']),
  );
}

export const countAllowed = (access: TBotAccess) =>
  Object.values(access).filter(v => v === 'allowed').length;
