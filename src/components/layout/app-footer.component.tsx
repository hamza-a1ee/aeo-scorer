import Link from 'next/link';

import { APP_ROUTES } from '@/constants/app-routes.constant';
import { SCORING_MODEL_VERSION } from '@/constants/scoring-weights.constant';

import { PageContainer } from './page-container.component';

export function AppFooter({ crawlerUserAgent }: { crawlerUserAgent: string }) {
  return (
    <footer id="crawler" className="border-t border-border bg-card">
      <PageContainer className="flex flex-wrap justify-between gap-4 py-8 text-[13px] text-muted-foreground">
        <span>
          Our crawler identifies as{' '}
          <code className="font-mono text-foreground">{crawlerUserAgent}</code>{' '}
          and honours robots.txt.{' '}
          <Link href={APP_ROUTES.ourCrawler} className="text-foreground underline-offset-2 hover:underline">
            About our crawler
          </Link>
        </span>
        <span>
          Scoring model v{SCORING_MODEL_VERSION} ·{' '}
          <Link href={APP_ROUTES.howScoringWorks} className="text-foreground underline-offset-2 hover:underline">
            weights published
          </Link>
        </span>
      </PageContainer>
    </footer>
  );
}
