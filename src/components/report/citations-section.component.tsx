import { MeterBar } from '@/components/aeo/meter-bar.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { IReport } from '@/types/interfaces/report.interface';

/** 4 · Citations: rate per engine, source mix, cited pages. */
export function CitationsSection({ citations, engines }: { citations: IReport['citations']; engines: IReport['engines'] }) {
  const labels = citations.engines.length ? Object.fromEntries(citations.engines.map(e => [e.engine, e.label])) : {};
  return (
    <section id="cites" aria-labelledby="cites-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="cites-h" title="Citations" description="Which engines cite your site, and where they get their information instead." />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {citations.engines.map(e => (
          <SurfaceCard key={e.engine} className={cn('flex flex-col gap-3 p-6', e.isTop && 'border-primary')}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="m-0 text-base font-semibold">{e.label}</h3>
              {e.isTop ? <span className="rounded-full bg-surface-dark px-2 py-[3px] font-mono text-xs text-surface-dark-foreground">CITES YOU MOST</span> : null}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[44px] leading-none font-bold tracking-[-0.02em]">{e.rate}%</span>
              <span className="text-sm text-muted-foreground">of answers cite your site</span>
            </div>
            <MeterBar value={e.rate} label={`${e.label} cites you in ${e.rate}% of answers`} />
            <span className="text-[13px] text-body">
              {e.cited} of {e.total} answers{e.topPage ? ' · most cited page ' : ''}
              {e.topPage ? <span className="font-mono">{e.topPage}</span> : null}
            </span>
          </SurfaceCard>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-[3_1_520px] overflow-x-auto rounded-xl border border-border bg-card">
          <Table className="min-w-[520px] text-sm">
            <TableCaption className="mt-0 caption-top px-4 pt-4 pb-2 text-left text-[15px] font-semibold text-foreground">
              Where each engine got its information · share of all citations
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-background hover:bg-background">
                <TableHead scope="col" className="h-auto px-4 py-3 font-semibold text-foreground">
                  Source
                </TableHead>
                {engines.map(e => (
                  <TableHead key={e} scope="col" className="h-auto px-4 py-3 text-right font-semibold text-foreground">
                    {labels[e] ?? e}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {citations.sources.map(s => (
                <TableRow key={s.key} className="border-subtle hover:bg-transparent">
                  <TableHead scope="row" className={cn('h-auto px-4 py-3 text-sm text-foreground', s.key === 'your_site' ? 'font-bold' : 'font-medium')}>
                    {s.label}
                  </TableHead>
                  {engines.map(e => (
                    <TableCell key={e} className="px-4 py-3 text-right font-mono">
                      {s.byEngine[e] ?? 0}%
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <SurfaceCard className="flex min-w-0 flex-[2_1_340px] flex-col gap-3 px-5 pt-4 pb-5">
          <h3 className="m-0 text-[15px] font-semibold">Your pages that get cited</h3>
          {citations.pages.length ? (
            citations.pages.map(p => (
              <div key={p.route} className="flex flex-col gap-1.5 border-t border-subtle pt-2.5">
                <div className="flex justify-between gap-2 font-mono text-[13px]">
                  <span>{p.route}</span>
                  <span>{p.pct}%</span>
                </div>
                <MeterBar value={p.pct} size="xs" tone={p.flagged ? 'danger' : 'dark'} label={`${p.route} ${p.pct}% of your citations`} />
                <span className={cn('text-xs', p.flagged ? 'text-destructive-strong' : 'text-muted-foreground')}>{p.note}</span>
              </div>
            ))
          ) : (
            <p className="m-0 border-t border-subtle pt-2.5 text-sm text-muted-foreground">No engine cited a page on your site.</p>
          )}
        </SurfaceCard>
      </div>
      <p className="m-0 text-[13px] text-muted-foreground">
        How often each AI bot crawls your site needs your server or CDN logs, so it is not part of a URL scan. Bot access (allowed or blocked) is under Site health.
      </p>
    </section>
  );
}
