'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ElapsedTime } from '@/components/aeo/elapsed-time.component';
import { AppHeader } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { AnswersLiveList } from '@/components/scan/answers-live-list.component';
import { EarlyStats } from '@/components/scan/early-stats.component';
import { FactSheetPendingCard, FactSheetReadyCard } from '@/components/scan/fact-sheet-ready-card.component';
import { StageList } from '@/components/scan/stage-list.component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { useScanStatus } from '@/query/scan.query';
import { parseError } from '@/utils/axios.util';

function ScanProgressSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy>
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-2 w-full" />
      <div className="flex flex-wrap gap-6">
        <Skeleton className="h-[480px] min-w-0 flex-[1_1_360px]" />
        <Skeleton className="h-[480px] min-w-0 flex-[1_1_420px]" />
      </div>
    </div>
  );
}

export function ScanProgressView({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, isPending } = useScanStatus(id);
  const scan = data?.data;

  useEffect(() => {
    if (scan && (scan.status === 'completed' || scan.status === 'partial')) {
      router.replace(APP_ROUTES.report(scan.shareToken));
    }
  }, [scan, router]);

  const canSkip = scan?.currentStage === 'engines' || scan?.currentStage === 'judge';

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader rightSlot={<span className="text-sm text-muted-foreground">You can close this tab. The report link works when the scan finishes.</span>} />
      <main>
        <PageContainer className="flex flex-col gap-8 pt-12 pb-[72px]">
          {isPending ? <ScanProgressSkeleton /> : null}

          {error && !scan ? (
            <Alert variant="destructive">
              <AlertTitle>We could not load this scan</AlertTitle>
              <AlertDescription>
                {parseError(error)}{' '}
                <Link href={APP_ROUTES.home} className="underline">
                  Start a new scan
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          {scan ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{scan.domain}</span>
                  <h1 className="m-0 text-[40px] leading-tight font-semibold tracking-[-0.02em]">{scan.stageTitle}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <ElapsedTime startedAt={scan.startedAt} endedAt={scan.completedAt} />
                  {scan.stageOrder ? <span className="font-mono text-foreground">Stage {scan.stageOrder} of 7</span> : null}
                </div>
              </div>

              <Progress value={scan.progressPct} aria-label="Scan progress" className="h-2 bg-border" />

              {scan.status === 'failed' ? (
                <Alert variant="destructive">
                  <AlertTitle>The scan stopped</AlertTitle>
                  <AlertDescription>
                    <p>{scan.error ?? 'Something went wrong while scanning.'}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href={APP_ROUTES.home}>Back to start</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-start gap-6">
                <StageList stages={scan.stages} />
                <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
                  {scan.factsReady ? (
                    <FactSheetReadyCard scanId={scan.id} brand={scan.brandName ?? scan.domain} factCount={scan.factsReady.count} canSkip={canSkip} />
                  ) : (
                    <FactSheetPendingCard />
                  )}
                  <AnswersLiveList answers={scan.answersSoFar} progress={scan.answersProgress} />
                  <EarlyStats early={scan.early} />
                </div>
              </div>
            </>
          ) : null}
        </PageContainer>
      </main>
    </div>
  );
}
