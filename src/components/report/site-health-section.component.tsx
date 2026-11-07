'use client';

import { ChevronDown } from 'lucide-react';
import { Fragment, useState } from 'react';

import { SectionHeading } from '@/components/aeo/section-heading.component';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { IReport, IRouteHealthRow } from '@/types/interfaces/report.interface';

function IssueDetail({ row }: { row: IRouteHealthRow }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13px] font-semibold">
        {row.route} · {row.issueCount} issue{row.issueCount === 1 ? '' : 's'}
      </span>
      {row.issues.map((i, idx) => {
        const [code, rest] = i.label.startsWith('robots.txt:') && i.detail.includes(' · ') ? i.detail.split(' · ') : [null, i.detail];
        return (
          <div key={`${i.code}-${idx}`} className="flex flex-wrap items-baseline gap-2.5 text-[13px]">
            <span className="w-[120px] shrink-0 font-mono text-destructive-strong">{i.label}</span>
            {code ? <code className="rounded bg-subtle px-1.5 py-0.5 font-mono">{code}</code> : null}
            <span className={code ? 'text-muted-foreground' : 'text-body'}>{rest}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 7 · Site health: bot access tiles and per-route table with expandable issues. */
export function SiteHealthSection({ health }: { health: IReport['siteHealth'] }) {
  const firstKey = health.routes.find(r => r.type === 'pricing' && r.issueCount)?.route ?? health.routes.find(r => r.issueCount)?.route;
  const [open, setOpen] = useState<Set<string>>(() => new Set(firstKey ? [firstKey] : []));
  const toggle = (route: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(route)) next.delete(route);
      else next.add(route);
      return next;
    });

  return (
    <section id="health" aria-labelledby="health-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="health-h" title="Site health by page" description={health.summary} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
        {health.bots.map(b => (
          <div key={b.name} className={cn('flex flex-col gap-1 rounded-[10px] border bg-card px-3.5 py-3', b.allowed ? 'border-border' : 'border-destructive-border')}>
            <span className="font-mono text-[13px] font-medium">{b.name}</span>
            <span className={cn('text-[13px] font-medium', b.allowed ? 'text-success' : 'text-destructive-strong')}>{b.allowed ? 'Allowed' : 'Blocked'}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="min-w-[860px] text-sm">
          <TableHeader>
            <TableRow className="bg-background hover:bg-background">
              {['Route', 'Type', 'Crawler access', 'Readable without JS', 'Schema', 'Last updated', 'Issues'].map(h => (
                <TableHead key={h} scope="col" className="h-auto px-4 py-3 font-semibold text-foreground">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {health.routes.map(r => {
              const isOpen = open.has(r.route);
              return (
                <Fragment key={r.route}>
                  <TableRow className="border-subtle hover:bg-transparent">
                    <TableCell className="px-4 py-3 font-mono text-[13px]">{r.route}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">{r.type}</TableCell>
                    <TableCell className={cn('px-4 py-3', !r.accessOk && 'text-destructive-strong')}>{r.access}</TableCell>
                    <TableCell className={cn('px-4 py-3', r.readable === false && 'text-destructive-strong')}>{r.readable === null ? '—' : r.readable ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="px-4 py-3">{r.schema}</TableCell>
                    <TableCell className={cn('px-4 py-3', r.stale ? 'text-destructive-strong' : 'text-foreground')}>{r.lastUpdated ?? 'none shown'}</TableCell>
                    <TableCell className="px-4 py-3">
                      {r.issueCount ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`issues-${r.route}`}
                          onClick={() => toggle(r.route)}
                          className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-1 font-semibold text-destructive-strong hover:bg-destructive-muted"
                        >
                          {r.issueCount}
                          <ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                          <span className="sr-only">issues on {r.route}</span>
                        </button>
                      ) : (
                        <span className="font-semibold">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isOpen ? (
                    <TableRow id={`issues-${r.route}`} className="border-subtle bg-background hover:bg-background">
                      <TableCell colSpan={7} className="px-4 pt-4 pb-5 whitespace-normal">
                        <IssueDetail row={r} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
