import type { Metadata } from 'next';

import { SAMPLE_ID } from '@/constants/app-routes.constant';
import { getCrawlerUserAgent } from '@/lib/env';
import { ReportView } from '@/views/report.view';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  return {
    title: token === SAMPLE_ID ? 'Sample AEO report · Tallybook' : 'AEO report · AEO App',
    description: 'What AI answer engines say about this app, scored out of 100, with the fixes drafted.',
  };
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ReportView token={token} crawlerUserAgent={getCrawlerUserAgent()} />;
}
