'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { useSkipToPartial } from '@/query/scan.query';

interface IFactSheetReadyCardProps {
  scanId: string;
  brand: string;
  factCount: number;
  canSkip: boolean;
  skipRequested?: boolean;
}

/** Dark card: review the fact sheet, or skip ahead to a partial report. */
export function FactSheetReadyCard({ scanId, brand, factCount, canSkip }: IFactSheetReadyCardProps) {
  const skip = useSkipToPartial(scanId);
  return (
    <section aria-labelledby="fs-h" className="flex flex-col gap-3 rounded-xl bg-surface-dark p-6 text-surface-dark-foreground">
      <span className="font-mono text-xs text-surface-dark-muted">FACT SHEET READY · {factCount} FACTS</span>
      <h2 id="fs-h" className="m-0 text-[22px] font-semibold">
        Check what we learned about {brand}
      </h2>
      <p className="m-0 text-[15px] leading-[1.55] text-surface-dark-muted">
        Every answer gets judged against this sheet. If a price or feature is wrong here, the report will be wrong too.
        Editing it re-judges the answers; no re-crawl needed.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Button asChild className="min-h-11 bg-card px-5 text-[15px] font-semibold text-foreground hover:bg-subtle">
          <Link href={APP_ROUTES.facts(scanId)}>Review fact sheet</Link>
        </Button>
        {canSkip ? (
          <Button
            variant="outline"
            className="min-h-11 border-muted-foreground bg-transparent px-5 text-[15px] text-surface-dark-foreground hover:bg-surface-dark-border hover:text-surface-dark-foreground"
            disabled={skip.isPending || skip.isSuccess}
            onClick={() => skip.mutate()}
          >
            {skip.isSuccess ? 'Finishing with what we have…' : 'Skip to partial report'}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

/** Placeholder shown before stage 3 finishes. */
export function FactSheetPendingCard() {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-dashed border-strong-border p-6">
      <span className="font-mono text-xs text-muted-foreground">FACT SHEET · STAGE 3</span>
      <p className="m-0 text-[15px] leading-[1.55] text-muted-foreground">
        Your fact sheet appears here once we have read your home, pricing and feature pages. You can check and edit it
        before the answers are judged.
      </p>
    </section>
  );
}
