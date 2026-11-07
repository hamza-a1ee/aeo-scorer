import Link from 'next/link';

import { MonoChip } from '@/components/aeo/mono-chip.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import type { IFixSummary } from '@/types/interfaces/fix.interface';

export const formatLift = (n: number) => (n >= 0.5 ? `+${Math.round(n)}` : '<+1');

/** 2 · "Do these three first". */
export function TopFixesSection({ token, fixes }: { token: string; fixes: IFixSummary[] }) {
  return (
    <section id="top" aria-labelledby="top-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="top-h" title={`Do ${fixes.length === 3 ? 'these three' : 'these'} first`} aside={<span className="text-sm text-muted-foreground">Ranked by score lift × ease</span>} />
      {fixes.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {fixes.map(f => (
            <SurfaceCard key={f.id} className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center justify-between">
                <span className="text-[28px] font-bold text-primary">{formatLift(f.liftPoints)}</span>
                <MonoChip>{f.effort}</MonoChip>
              </div>
              <h3 className="m-0 text-[17px] leading-[1.35] font-semibold">{f.title}</h3>
              <p className="m-0 text-sm leading-[1.55] text-muted-foreground">{f.why}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <span className="font-mono text-[13px] text-body">{f.route}</span>
                <Button asChild className="min-h-11 px-4 font-semibold">
                  <Link href={APP_ROUTES.fix(token, f.id)}>Open fix</Link>
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-muted-foreground">No fixes needed. Every check passed.</p>
      )}
    </section>
  );
}
