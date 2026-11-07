'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { SectionNav } from '@/components/aeo/section-nav.component';
import { AppFooter } from '@/components/layout/app-footer.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { AccuracySection } from '@/components/report/accuracy-section.component';
import { AllFixesSection } from '@/components/report/all-fixes-section.component';
import { CitationsSection } from '@/components/report/citations-section.component';
import { GapReportSection } from '@/components/report/gap-report-section.component';
import { ReportHeader } from '@/components/report/report-header.component';
import { ReputationSection } from '@/components/report/reputation-section.component';
import { RunDetailsSection } from '@/components/report/run-details-section.component';
import { ScoreSection } from '@/components/report/score-section.component';
import { ShareOfVoiceSection } from '@/components/report/share-of-voice-section.component';
import { SiteHealthSection } from '@/components/report/site-health-section.component';
import { TopFixesSection } from '@/components/report/top-fixes-section.component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES, SAMPLE_ID } from '@/constants/app-routes.constant';
import { useReport } from '@/query/report.query';
import { getErrorStatus, parseError } from '@/utils/axios.util';
import { formatDateTime } from '@/utils/format.util';

const NAV = [
  { id: 'score', label: 'Score' },
  { id: 'top', label: 'Top fixes' },
  { id: 'gaps', label: 'Gap report' },
  { id: 'cites', label: 'Citations' },
  { id: 'accuracy', label: 'Accuracy' },
  { id: 'reputation', label: 'Reputation' },
  { id: 'health', label: 'Site health' },
  { id: 'sov', label: 'Share of voice' },
  { id: 'fixes', label: 'Fixes' },
  { id: 'run', label: 'Run details' },
];

function ReportSkeleton({ waiting }: { waiting: boolean }) {
  return (
    <div className="flex flex-col gap-8" aria-busy>
      {waiting ? (
        <Alert>
          <AlertTitle>Your report is being written</AlertTitle>
          <AlertDescription>The scan is still running. This page fills in by itself when it finishes.</AlertDescription>
        </Alert>
      ) : null}
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[320px] w-full rounded-2xl" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

export function ReportView({ token, crawlerUserAgent }: { token: string; crawlerUserAgent: string }) {
  const { data, error, isPending, failureCount, failureReason } = useReport(token);
  const report = data?.data;
  const waiting = isPending && failureCount > 0 && getErrorStatus(failureReason) === 409;
  const loaded = !!report;

  // Sections render after the data arrives, so honour a #section link once they exist.
  useEffect(() => {
    if (!loaded || !window.location.hash) return;
    // Instant jump: a deep link should land on the section, not animate there.
    const t = window.setTimeout(() => {
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
    }, 100);
    return () => window.clearTimeout(t);
  }, [loaded]);

  return (
    <div className="min-h-dvh bg-background">
      <ReportHeader token={token} />
      <main>
        <PageContainer className="flex flex-col gap-12 pt-10 pb-24">
          {isPending ? <ReportSkeleton waiting={waiting} /> : null}

          {error && !report ? (
            <Alert variant="destructive">
              <AlertTitle>{getErrorStatus(error) === 404 ? 'Report not found' : 'We could not load this report'}</AlertTitle>
              <AlertDescription>
                {parseError(error)}{' '}
                <Link href={APP_ROUTES.home} className="underline">
                  Start a new scan
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          {report ? (
            <>
              <div className="flex flex-col gap-4">
                {token === SAMPLE_ID ? (
                  <span className="w-fit rounded-full bg-subtle px-3 py-1.5 font-mono text-[13px]">Sample report · demo data</span>
                ) : null}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h1 className="m-0 text-[40px] leading-tight font-semibold tracking-[-0.02em]">{report.brandName}</h1>
                  <span className="font-mono text-sm text-muted-foreground">
                    {report.domain} · {formatDateTime(report.finishedAt)} · model v{report.modelVersion}
                  </span>
                </div>
                <SectionNav items={NAV} />
              </div>

              <ScoreSection score={report.score} />
              <TopFixesSection token={token} fixes={report.topFixes} />
              <GapReportSection gaps={report.gaps} multiEngine={report.engines.length > 1} />
              <CitationsSection citations={report.citations} engines={report.engines} />
              <AccuracySection accuracy={report.accuracy} />
              <ReputationSection reputation={report.reputation} />
              <SiteHealthSection health={report.siteHealth} />
              <ShareOfVoiceSection sov={report.shareOfVoice} />
              <AllFixesSection token={token} fixes={report.fixes} />
              <RunDetailsSection details={report.runDetails} />
            </>
          ) : null}
        </PageContainer>
      </main>
      <AppFooter crawlerUserAgent={crawlerUserAgent} />
    </div>
  );
}
