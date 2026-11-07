import { MeterBar } from './meter-bar.component';

interface ISubScoreBarProps {
  name: string;
  description: string;
  value: number;
  max: number;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function SubScoreBar({ name, description, value, max }: ISubScoreBarProps) {
  const ratio = max ? value / max : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-sm">
        <span>
          <span className="font-semibold">{name}</span>{' '}
          <span className="text-muted-foreground">· {description}</span>
        </span>
        <span className="font-mono">
          <span className="font-medium">{fmt(value)}</span>
          <span className="text-muted-foreground">/{max}</span>
        </span>
      </div>
      <MeterBar
        value={ratio * 100}
        tone={ratio < 0.45 ? 'danger' : 'dark'}
        label={`${name} ${fmt(value)} of ${max}`}
      />
    </div>
  );
}
