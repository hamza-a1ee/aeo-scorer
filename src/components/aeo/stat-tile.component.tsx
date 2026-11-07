import { cn } from '@/lib/utils';

import { SurfaceCard } from './surface-card.component';

interface IStatTileProps {
  value: React.ReactNode;
  suffix?: string;
  label: string;
  danger?: boolean;
}

export function StatTile({ value, suffix, label, danger }: IStatTileProps) {
  return (
    <SurfaceCard className="p-4">
      <div
        className={cn(
          'text-[28px] font-semibold',
          danger && 'text-destructive',
        )}
      >
        {value}
        {suffix ? (
          <span className="text-base text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
    </SurfaceCard>
  );
}
