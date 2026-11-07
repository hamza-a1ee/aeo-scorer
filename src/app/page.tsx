import { getCrawlerUserAgent, getEnv } from '@/lib/env';
import { ScanLandingView } from '@/views/scan-landing.view';

export default function HomePage() {
  const env = getEnv();
  return (
    <ScanLandingView
      crawlerUserAgent={getCrawlerUserAgent()}
      maxPages={env.MAX_PAGES}
      maxQuestions={env.MAX_QUESTIONS}
    />
  );
}
