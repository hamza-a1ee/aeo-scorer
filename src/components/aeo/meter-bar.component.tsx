import { cn } from '@/lib/utils';

interface IMeterBarProps {
  /** 0–100 */
  value: number;
  tone?: 'dark' | 'danger' | 'muted';
  size?: 'xs' | 'sm' | 'lg';
  className?: string;
  label?: string;
}

const TONES = {
  dark: 'bg-primary',
  danger: 'bg-destructive',
  muted: 'bg-chart-muted',
};

const SIZES = { xs: 'h-1.5', sm: 'h-2', lg: 'h-6 rounded-md' };

/** Horizontal bar for sub-scores, citation rates, cited pages and share of voice. */
export function MeterBar({
  value,
  tone = 'dark',
  size = 'sm',
  className,
  label,
}: IMeterBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full overflow-hidden rounded-full',
        size === 'lg' ? 'bg-background' : 'bg-subtle',
        SIZES[size],
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          size === 'lg' && 'rounded-md',
          TONES[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
