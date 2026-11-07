'use client';

import { useState } from 'react';

import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { Input } from '@/components/ui/input';
import type { IRating, IRatingPatchPayload } from '@/types/interfaces/fact-sheet.interface';

function countText(r: IRating) {
  if (r.count) return `${r.count.toLocaleString('en-US')} ${r.platform === 'app_store' || r.platform === 'google_play' ? 'ratings' : 'reviews'}`;
  return r.value === null ? 'Not found' : 'count unknown';
}

function sourceText(r: IRating) {
  if (r.origin === 'user') return 'Added by you';
  if (r.origin === 'site') return 'Linked from your site';
  if (r.origin === 'engine') return 'Quoted by an engine';
  return 'No link on site';
}

function RatingCell({ rating, readOnly, onSave }: { rating: IRating; readOnly: boolean; onSave: (p: IRatingPatchPayload) => void }) {
  const initial = rating.value === null ? '' : String(rating.value);
  const [draft, setDraft] = useState(initial);
  const [synced, setSynced] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  if (initial !== synced) {
    setSynced(initial);
    setDraft(initial);
  }
  const id = `rating-${rating.platform}`;

  const commit = () => {
    const raw = draft.trim().replace(',', '.');
    if (raw === initial) return;
    if (!raw) {
      setError(null);
      onSave({ platform: rating.platform, value: null });
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 5) {
      setError('Enter a rating from 0 to 5');
      return;
    }
    setError(null);
    onSave({ platform: rating.platform, value: Math.round(n * 100) / 100 });
  };

  return (
    <div className="flex flex-col gap-2 border-t border-r border-subtle px-6 py-5">
      <label htmlFor={id} className="text-sm font-medium">
        {rating.label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          inputMode="decimal"
          value={draft}
          placeholder="—"
          disabled={readOnly}
          aria-invalid={!!error || undefined}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className="min-h-11 w-[72px] border-strong-border px-2.5 font-mono text-[15px] shadow-none md:text-[15px]"
        />
        <span className="text-[13px] text-muted-foreground">{countText(rating)}</span>
      </div>
      {error ? <span className="text-xs text-destructive-strong">{error}</span> : <span className="text-xs text-muted-foreground">{sourceText(rating)}</span>}
    </div>
  );
}

interface IRatingGridProps {
  ratings: IRating[];
  readOnly: boolean;
  onSave: (payload: IRatingPatchPayload) => void;
}

export function RatingGrid({ ratings, readOnly, onSave }: IRatingGridProps) {
  return (
    <SurfaceCard aria-labelledby="rate-h" className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-6 py-4">
        <h2 id="rate-h" className="m-0 text-xl font-semibold">
          Ratings
        </h2>
        <span className="text-[13px] text-muted-foreground">Used to check the ratings engines quote. Live lookup arrives in Phase 2.</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {ratings.map(r => (
          <RatingCell key={r.platform} rating={r} readOnly={readOnly} onSave={onSave} />
        ))}
      </div>
    </SurfaceCard>
  );
}
