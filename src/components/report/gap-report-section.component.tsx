'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { PositionBadge } from '@/components/aeo/position-badge.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { IReport } from '@/types/interfaces/report.interface';

const FILTERS = ['all', 'absent', 'doubled'] as const;

const pillClass =
  'min-h-9 rounded-full border border-strong-border bg-card px-3 text-[13px] font-medium text-foreground shadow-none first:rounded-full last:rounded-full data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background';

/** 3 · Gap report with a ?gap= filter (all / absent / category + task). */
export function GapReportSection({ gaps, multiEngine }: { gaps: IReport['gaps']; multiEngine: boolean }) {
  const [filter, setFilter] = useQueryState('gap', parseAsStringLiteral(FILTERS).withDefault('all'));
  const absent = gaps.rows.filter(r => r.worst === 'absent');
  const rows = filter === 'absent' ? absent : filter === 'doubled' ? gaps.rows.filter(r => r.doubled) : gaps.rows;

  return (
    <section id="gaps" aria-labelledby="gaps-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading
        id="gaps-h"
        title="Gap report"
        description={gaps.summary}
        aside={
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={v => v && setFilter(v === 'all' ? null : (v as (typeof FILTERS)[number]))}
            aria-label="Filter questions"
            className="flex flex-wrap gap-1.5"
            spacing={1}
          >
            <ToggleGroupItem value="all" className={pillClass}>
              All {gaps.rows.length}
            </ToggleGroupItem>
            <ToggleGroupItem value="absent" className={pillClass}>
              Absent {absent.length}
            </ToggleGroupItem>
            <ToggleGroupItem value="doubled" className={pillClass}>
              Category + task
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="min-w-[980px] text-sm">
          <TableHeader>
            <TableRow className="bg-background hover:bg-background">
              {['Question', 'Intent', 'Position', 'Cited from your site', 'Page that should be cited', 'Why it was not'].map(h => (
                <TableHead key={h} scope="col" className="h-auto px-4 py-3 font-semibold text-foreground">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.questionId} className="border-subtle align-top hover:bg-transparent">
                <TableCell className="max-w-[260px] min-w-[220px] px-4 py-3.5 font-medium whitespace-normal">{r.question}</TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                  {r.intent}
                  {r.doubled ? ' ×2' : ''}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <PositionBadge position={r.worst} />
                    {multiEngine && r.positions.some(p => p.position !== r.worst) ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {r.positions.map(p => `${p.label} ${p.position}`).join(' · ')}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-[13px]">{r.cited ?? '—'}</TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-[13px] whitespace-normal text-primary">{r.shouldCite ?? '—'}</TableCell>
                <TableCell className="max-w-[320px] min-w-[260px] px-4 py-3.5 leading-normal whitespace-normal text-body">{r.why}</TableCell>
              </TableRow>
            ))}
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No questions match this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
