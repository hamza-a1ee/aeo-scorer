import type { Metadata } from 'next';

import { getCrawlerUserAgent } from '@/lib/env';
import { HowScoringWorksView } from '@/views/how-scoring-works.view';

export const metadata: Metadata = { title: 'How scoring works · AEO App' };

export default function HowScoringWorksPage() {
  return <HowScoringWorksView crawlerUserAgent={getCrawlerUserAgent()} />;
}
