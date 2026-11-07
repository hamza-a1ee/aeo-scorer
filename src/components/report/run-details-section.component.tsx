import type { IReport } from '@/types/interfaces/report.interface';

/** 10 · Run details. */
export function RunDetailsSection({ details }: { details: IReport['runDetails'] }) {
  return (
    <section id="run" aria-labelledby="run-h" className="flex scroll-mt-6 flex-col gap-4">
      <h2 id="run-h" className="m-0 text-xl font-semibold">
        Run details
      </h2>
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px overflow-hidden rounded-xl border border-border bg-border">
        {details.map((d, i) => (
          <div key={`${d.label}-${i}`} className={d.label === 'Note' ? 'col-span-full bg-card p-4' : 'bg-card p-4'}>
            <dt className="text-xs text-muted-foreground">{d.label}</dt>
            <dd className="mx-0 mt-1 mb-0 font-mono text-sm">{d.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
