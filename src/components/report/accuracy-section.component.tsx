import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import type { IReport } from '@/types/interfaces/report.interface';

/** 5 · Accuracy: every wrong claim next to the fact sheet. */
export function AccuracySection({ accuracy }: { accuracy: IReport['accuracy'] }) {
  return (
    <section id="accuracy" aria-labelledby="acc-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="acc-h" title="Accuracy" description={accuracy.summary} />
      <div className="flex flex-col gap-3">
        {accuracy.wrong.length ? (
          accuracy.wrong.map((w, i) => (
            <SurfaceCard key={i} className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-destructive-strong uppercase">
                  ENGINE SAID · {w.kind}
                  {w.doubled ? ' ×2' : ''}
                </span>
                <span className="text-[15px] leading-normal">“{w.said}”</span>
                <span className="text-[13px] text-muted-foreground">
                  {w.engineLabel}
                  {w.question ? ` · ${w.question}` : ''}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-success">YOUR FACT SHEET SAYS</span>
                <span className="text-[15px] leading-normal">{w.truth || '—'}</span>
                {w.source ? <span className="font-mono text-[13px] text-primary">{w.source}</span> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-body">SUGGESTED CORRECTION</span>
                <span className="text-sm leading-normal text-body">{w.correction || 'State the correct fact in one plain sentence on the source page.'}</span>
              </div>
            </SurfaceCard>
          ))
        ) : (
          <SurfaceCard className="p-6 text-sm text-muted-foreground">No engine said anything that contradicts your fact sheet.</SurfaceCard>
        )}
      </div>
    </section>
  );
}
