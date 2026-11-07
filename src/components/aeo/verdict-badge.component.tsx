import type { TLiveVerdict } from '@/types/interfaces/scan.interface';

import { ToneBadge, type TTone } from './tone-badge.component';

type TVerdictKey =
  | TLiveVerdict
  | 'matches'
  | 'wrong'
  | 'missing'
  | 'allowed'
  | 'blocked';

const MAP: Record<TVerdictKey, { label: string; tone: TTone }> = {
  mentioned: { label: 'Mentioned', tone: 'good' },
  absent: { label: 'Absent', tone: 'bad' },
  wrong_fact: { label: 'Wrong fact', tone: 'bad' },
  answered: { label: 'Judging…', tone: 'neutral' },
  matches: { label: 'Matches', tone: 'good' },
  wrong: { label: 'Wrong', tone: 'bad' },
  missing: { label: 'Missing', tone: 'neutral' },
  allowed: { label: 'Allowed', tone: 'good' },
  blocked: { label: 'Blocked', tone: 'bad' },
};

export function VerdictBadge({ verdict }: { verdict: TVerdictKey }) {
  const { label, tone } = MAP[verdict];
  return <ToneBadge tone={tone}>{label}</ToneBadge>;
}
