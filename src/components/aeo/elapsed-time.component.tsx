'use client';

import { useEffect, useState } from 'react';

import { formatElapsed } from '@/utils/format.util';

/** Live "3 min 12 s" counter from a start timestamp. */
export function ElapsedTime({
  startedAt,
  endedAt,
}: {
  startedAt: string | null;
  endedAt?: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endedAt]);

  if (!startedAt) return <span>Starting…</span>;
  const end = endedAt ? new Date(endedAt).getTime() : now;
  return <span>{formatElapsed(end - new Date(startedAt).getTime())} elapsed</span>;
}
