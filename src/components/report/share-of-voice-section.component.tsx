import { MeterBar } from '@/components/aeo/meter-bar.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { cn } from '@/lib/utils';
import type { IReport } from '@/types/interfaces/report.interface';

/** 8 · Share of voice. */
export function ShareOfVoiceSection({ sov }: { sov: IReport['shareOfVoice'] }) {
  return (
    <section id="sov" aria-labelledby="sov-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="sov-h" title="Share of voice" description={sov.summary} />
      <SurfaceCard className="flex flex-col gap-3.5 p-6">
        {sov.items.map(s => (
          <div key={s.name} className="flex items-center gap-4">
            <span className={cn('w-[120px] shrink-0 truncate text-sm', s.isUs ? 'font-bold' : 'font-medium')}>{s.name}</span>
            <MeterBar value={s.pct} size="lg" tone={s.isUs ? 'dark' : 'muted'} label={`${s.name} ${s.pct}% of mentions`} className="flex-auto" />
            <span className="w-12 shrink-0 text-right font-mono text-sm">{s.pct}%</span>
          </div>
        ))}
      </SurfaceCard>
    </section>
  );
}
