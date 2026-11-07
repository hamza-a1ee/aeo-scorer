/** 192000 → "3 min 12 s" */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m} min ${s} s` : `${s} s`;
}

/** 41000 → "0:41" */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** "2026-11-07T14:20:00Z" → "7 Nov 2026, 14:20" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "2026-03-01" → "Mar 2026" */
export function formatMonthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}`;
}

export const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function countWords(text: string | null | undefined): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}
