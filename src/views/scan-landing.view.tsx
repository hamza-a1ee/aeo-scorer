import { ComparisonTable } from '@/components/landing/comparison-table.component';
import { HeroScanForm } from '@/components/landing/hero-scan-form.component';
import { PipelineStepsStrip } from '@/components/landing/pipeline-steps-strip.component';
import { ScorePartsGrid } from '@/components/landing/score-parts-grid.component';
import { SectionHeading } from '@/components/aeo/section-heading.component';
import { AppFooter } from '@/components/layout/app-footer.component';
import { AppHeader, HeaderLink } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { APP_ROUTES } from '@/constants/app-routes.constant';

interface IScanLandingViewProps {
  crawlerUserAgent: string;
  maxPages: number;
  maxQuestions: number;
}

export function ScanLandingView({
  crawlerUserAgent,
  maxPages,
  maxQuestions,
}: IScanLandingViewProps) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        rightSlot={
          <nav aria-label="Main" className="flex flex-wrap items-center gap-6">
            <HeaderLink href="#scoring">How scoring works</HeaderLink>
            <HeaderLink href={APP_ROUTES.sampleReport}>Sample report</HeaderLink>
            <HeaderLink href={APP_ROUTES.ourCrawler}>Our crawler</HeaderLink>
          </nav>
        }
      />

      <main>
        <PageContainer className="flex flex-col items-center gap-6 pt-24 pb-[72px] text-center">
          <span className="rounded-full bg-subtle px-3 py-1.5 font-mono text-[13px] text-primary">
            Answer engine optimization · free, no sign-up
          </span>
          <h1 className="m-0 max-w-[900px] text-[clamp(40px,6vw,68px)] leading-[1.04] font-semibold tracking-[-0.02em]">
            Find out what AI answer engines say about your app. Then fix it.
          </h1>
          <p className="m-0 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">
            Paste one URL. We crawl your site, write the buyer questions you
            should win, ask the engines, check every answer against your own
            pages, and hand back a score out of 100 with the fixes already
            drafted.
          </p>
          <HeroScanForm maxPages={maxPages} maxQuestions={maxQuestions} />
        </PageContainer>

        <section aria-labelledby="scoring-h" id="scoring" className="scroll-mt-6">
          <PageContainer className="pt-6 pb-[72px]">
            <SectionHeading
              id="scoring-h"
              title="One score, five parts"
              className="mb-6 [&_h2]:text-[32px]"
              aside={
                <p className="m-0 max-w-[440px] text-[15px] text-muted-foreground">
                  60 points come from what engines say. 40 come from your site,
                  because that is the part you can change.
                </p>
              }
            />
            <ScorePartsGrid />
          </PageContainer>
        </section>

        <section aria-labelledby="how-h" className="border-y border-border bg-card">
          <PageContainer className="py-[72px]">
            <h2 id="how-h" className="mt-0 mb-8 text-[32px] font-semibold tracking-[-0.01em]">
              What happens after you paste the URL
            </h2>
            <PipelineStepsStrip />
          </PageContainer>
        </section>

        <section aria-labelledby="diff-h">
          <PageContainer className="py-[72px]">
            <h2 id="diff-h" className="mt-0 mb-8 text-[32px] font-semibold tracking-[-0.01em]">
              Most tools do half of this
            </h2>
            <ComparisonTable />
          </PageContainer>
        </section>
      </main>

      <AppFooter crawlerUserAgent={crawlerUserAgent} />
    </div>
  );
}
