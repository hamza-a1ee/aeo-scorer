'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { Input } from '@/components/ui/input';
import type { ICompetitor } from '@/types/interfaces/fact-sheet.interface';

function originNote(c: ICompetitor) {
  if (c.origin === 'engine') return 'added by engine answers';
  if (c.origin === 'user') return 'added by you';
  return c.sourceRoute ? `named on ${c.sourceRoute}` : 'named on your site';
}

interface ICompetitorChipsProps {
  competitors: ICompetitor[];
  readOnly: boolean;
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
}

export function CompetitorChips({ competitors, readOnly, onAdd, onRemove }: ICompetitorChipsProps) {
  const [name, setName] = useState('');
  const submit = () => {
    const n = name.trim();
    if (!n) return;
    if (competitors.some(c => c.name.toLowerCase() === n.toLowerCase())) {
      setName('');
      return;
    }
    onAdd(n);
    setName('');
  };

  return (
    <SurfaceCard aria-labelledby="comp-h" className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="comp-h" className="m-0 text-xl font-semibold">
          Competitors
        </h2>
        <span className="text-[13px] text-muted-foreground">Seeds the comparison questions and share of voice</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {competitors.map(c => (
          <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-strong-border py-2 pr-2 pl-3.5 text-sm">
            {c.name}
            <span className="text-xs text-muted-foreground">{originNote(c)}</span>
            <button
              type="button"
              aria-label={`Remove ${c.name}`}
              disabled={readOnly || c.id < 0}
              onClick={() => onRemove(c.id)}
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border-0 bg-subtle text-body hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-3" strokeWidth={2.5} aria-hidden />
            </button>
          </span>
        ))}
        <label htmlFor="addcomp" className="sr-only">
          Add a competitor
        </label>
        <Input
          id="addcomp"
          value={name}
          disabled={readOnly}
          placeholder="Add a competitor"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          onBlur={submit}
          className="min-h-11 w-[200px] rounded-full border-dashed border-strong-border px-3.5 text-sm shadow-none"
        />
      </div>
    </SurfaceCard>
  );
}
