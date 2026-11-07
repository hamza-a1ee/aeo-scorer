import type { Metadata } from 'next';

import { getCrawlerUserAgent, getEnv } from '@/lib/env';
import { OurCrawlerView } from '@/views/our-crawler.view';

export const metadata: Metadata = { title: 'Our crawler · AEO App' };

export default function OurCrawlerPage() {
  return <OurCrawlerView crawlerUserAgent={getCrawlerUserAgent()} maxPages={getEnv().MAX_PAGES} />;
}
