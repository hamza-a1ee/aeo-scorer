import type { TPosition } from '@/types/enums/answer.enum';

import { ToneBadge, type TTone } from './tone-badge.component';

const MAP: Record<TPosition, { label: string; tone: TTone }> = {
  first: { label: 'First', tone: 'good' },
  listed: { label: 'Listed', tone: 'neutral' },
  absent: { label: 'Absent', tone: 'bad' },
};

export function PositionBadge({
  position,
  prefix,
}: {
  position: TPosition;
  prefix?: string;
}) {
  const { label, tone } = MAP[position];
  return (
    <ToneBadge tone={tone}>
      {prefix ? `${prefix} · ` : ''}
      {label}
    </ToneBadge>
  );
}
