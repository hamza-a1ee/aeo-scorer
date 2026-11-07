import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { VerdictBadge } from '@/components/aeo/verdict-badge.component';
import { cn } from '@/lib/utils';
import type { IReport } from '@/types/interfaces/report.interface';

/** 6 · Reputation: sentiment split, ratings quoted vs real, themes and sources. */
export function ReputationSection({ reputation }: { reputation: IReport['reputation'] }) {
  const s = reputation.sentiment;
  return (
    <section id="reputation" aria-labelledby="rep-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="rep-h" title={reputation.title} description="Reported, never caps the grade. A real rating quoted correctly is accurate even when it is low." />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        <SurfaceCard className="flex flex-col gap-3 p-6">
          <span className="text-[13px] text-muted-foreground">Sentiment · {s.total} answers</span>
          {s.total ? (
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${s.positive} positive, ${s.neutral} neutral, ${s.negative} negative`}>
              {s.positive ? <div className="bg-primary" style={{ flex: s.positive }} /> : null}
              {s.neutral ? <div className="bg-strong-border" style={{ flex: s.neutral }} /> : null}
              {s.negative ? <div className="bg-destructive" style={{ flex: s.negative }} /> : null}
            </div>
          ) : (
            <div className="h-3 rounded-full bg-subtle" />
          )}
          <div className="flex flex-wrap gap-3 text-[13px] text-body">
            <span>{s.positive} positive</span>
            <span>{s.neutral} neutral</span>
            <span>{s.negative} negative</span>
          </div>
          {reputation.negativeLine ? (
            <p className="mt-1 mb-0 rounded-md bg-destructive-muted p-3 text-sm leading-normal text-destructive-strong">
              Repeated negative line: “{reputation.negativeLine}”
            </p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="flex flex-col gap-3 p-6">
          <span className="text-[13px] text-muted-foreground">Ratings quoted</span>
          {reputation.ratings.map(r => (
            <div key={r.platform} className="flex items-center justify-between gap-3 border-t border-subtle py-2">
              <span className="text-sm font-medium">{r.label}</span>
              <span className="font-mono text-[13px]">
                {r.quoted ?? '—'} <span className="text-muted-foreground">vs {r.real ?? '—'}</span>
              </span>
              <VerdictBadge verdict={r.verdict} />
            </div>
          ))}
        </SurfaceCard>

        <SurfaceCard className="flex flex-col gap-3 p-6">
          <span className="text-[13px] text-muted-foreground">Themes engines repeat</span>
          <div className="flex flex-wrap gap-2">
            {reputation.themes.length ? (
              reputation.themes.map(t => (
                <span
                  key={`${t.tone}-${t.text}`}
                  className={cn('rounded-md px-2.5 py-1.5 text-[13px]', t.tone === 'positive' ? 'bg-subtle text-success' : 'bg-destructive-muted text-destructive-strong')}
                >
                  {t.text}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-muted-foreground">No repeated themes.</span>
            )}
          </div>
          <span className="mt-1 text-[13px] text-muted-foreground">Review sources named</span>
          <div className="flex flex-wrap gap-2 text-[13px]">
            {reputation.reviewSources.length ? (
              reputation.reviewSources.map(src => (
                <span key={src} className="rounded-md border border-strong-border px-2.5 py-1.5">
                  {src}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">None named.</span>
            )}
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
