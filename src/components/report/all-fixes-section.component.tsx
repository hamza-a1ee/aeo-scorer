import { Check } from 'lucide-react';
import Link from 'next/link';

import { MonoChip } from '@/components/aeo/mono-chip.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { FIX_TYPE_META } from '@/constants/fix-types.constant';
import { capitalizeFirstLetter } from '@/utils/helper.util';
import type { IFixSummary } from '@/types/interfaces/fix.interface';

/** 9 · All generated fixes. */
export function AllFixesSection({ token, fixes }: { token: string; fixes: IFixSummary[] }) {
  return (
    <section id="fixes" aria-labelledby="fixes-h" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeading id="fixes-h" title="All generated fixes" description="Built only from your fact sheet. Blanks are marked [confirm: …], never guessed." />
      <SurfaceCard className="overflow-hidden">
        {fixes.map(f => (
          <Link
            key={f.id}
            href={APP_ROUTES.fix(token, f.id)}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-subtle px-6 py-4 text-foreground no-underline first:border-t-0 hover:bg-background"
          >
            <span className="flex shrink-0 basis-[180px] items-center gap-2 text-[15px] font-semibold">
              {f.done ? <Check className="size-4 text-success" aria-label="Done" /> : null}
              {FIX_TYPE_META[f.type].shortTitle}
            </span>
            <span className="min-w-0 flex-[1_1_280px] text-sm text-muted-foreground">{f.gap}</span>
            <span className="shrink-0 basis-[160px] font-mono text-[13px] text-body">{f.route}</span>
            <MonoChip className="normal-case font-sans">{capitalizeFirstLetter(f.effort)}</MonoChip>
          </Link>
        ))}
        {!fixes.length ? <p className="m-0 px-6 py-4 text-sm text-muted-foreground">No fixes were needed.</p> : null}
      </SurfaceCard>
    </section>
  );
}
