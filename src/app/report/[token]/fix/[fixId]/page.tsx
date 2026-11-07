import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FixView } from '@/views/fix.view';

export const metadata: Metadata = { title: 'Fix · AEO App' };

export default async function FixPage({ params }: { params: Promise<{ token: string; fixId: string }> }) {
  const { token, fixId } = await params;
  const id = Number(fixId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <FixView token={token} fixId={id} />;
}
