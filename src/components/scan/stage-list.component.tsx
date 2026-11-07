import { Check, X } from 'lucide-react';

import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { cn } from '@/lib/utils';
import type { IStageView } from '@/types/interfaces/scan.interface';

function StageIcon({ status }: { status: IStageView['status'] }) {
  if (status === 'done' || status === 'skipped') {
    return (
      <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-primary-foreground', status === 'done' ? 'bg-primary' : 'bg-chart-muted')}>
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
        <X className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (status === 'running') {
    return <span className="size-6 shrink-0 animate-spin rounded-full border-[3px] border-strong-border border-t-primary" aria-hidden />;
  }
  return <span className="size-6 shrink-0 rounded-full border-2 border-strong-border" aria-hidden />;
}

/** The seven pipeline stages with status, duration or progress. */
export function StageList({ stages }: { stages: IStageView[] }) {
  return (
    <SurfaceCard aria-labelledby="stages-h" className="min-w-0 flex-[1_1_360px] py-2">
      <h2 id="stages-h" className="m-0 px-6 pt-4 pb-2 text-[13px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
        Stages
      </h2>
      <ol className="m-0 list-none p-0">
        {stages.map(s => (
          <li key={s.stage} className="flex items-start gap-4 border-t border-subtle px-6 py-4" aria-current={s.status === 'running' ? 'step' : undefined}>
            <StageIcon status={s.status} />
            <div className="flex min-w-0 flex-auto flex-col gap-1">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[15px] font-semibold">{s.title}</span>
                <span className="font-mono text-[13px] text-muted-foreground">{s.meta}</span>
              </div>
              <span className="text-sm leading-normal text-muted-foreground">{s.description}</span>
            </div>
          </li>
        ))}
      </ol>
    </SurfaceCard>
  );
}
