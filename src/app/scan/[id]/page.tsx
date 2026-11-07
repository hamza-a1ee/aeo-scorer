import type { Metadata } from 'next';

import { ScanProgressView } from '@/views/scan-progress.view';

export const metadata: Metadata = { title: 'Scanning · AEO App' };

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScanProgressView id={id} />;
}
