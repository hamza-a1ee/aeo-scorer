import type { Metadata } from 'next';

import { FactSheetView } from '@/views/fact-sheet.view';

export const metadata: Metadata = { title: 'Fact sheet · AEO App' };

export default async function FactSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FactSheetView id={id} />;
}
