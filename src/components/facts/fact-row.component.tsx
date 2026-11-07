'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { IFact } from '@/types/interfaces/fact-sheet.interface';

interface IFactRowProps {
  fact: IFact;
  origin: string;
  readOnly: boolean;
  onSave: (value: string | null) => void;
}

/** One fact: editable value, red note when unconfirmed, and the page + quote it came from. */
export function FactRow({ fact, origin, readOnly, onSave }: IFactRowProps) {
  const [draft, setDraft] = useState(fact.value ?? '');
  const [synced, setSynced] = useState(fact.value);
  if (fact.value !== synced) {
    // Server value changed (refetch or rollback): adopt it.
    setSynced(fact.value);
    setDraft(fact.value ?? '');
  }
  const flagged = !!fact.note && !fact.confirmed;
  const id = `fact-${fact.id}`;

  const commit = () => {
    const next = draft.trim() || null;
    if (next !== (fact.value ?? null)) onSave(next);
  };

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-4 border-t border-subtle px-6 py-4">
      <label htmlFor={id} className="shrink-0 basis-[180px] pt-[11px] text-sm font-medium">
        {fact.label}
      </label>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
        <Input
          id={id}
          value={draft}
          placeholder="[confirm]"
          disabled={readOnly}
          aria-invalid={flagged || undefined}
          aria-describedby={flagged ? `${id}-note` : undefined}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className={cn(
            'min-h-11 border-strong-border bg-card px-3 text-[15px] shadow-none md:text-[15px]',
            flagged && 'border-destructive-border bg-destructive-muted aria-invalid:ring-0',
          )}
        />
        {flagged ? (
          <span id={`${id}-note`} className="text-[13px] text-destructive-strong">
            {fact.note}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1 pt-1">
        {fact.sourceRoute ? (
          <a href={`${origin}${fact.sourceRoute}`} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-foreground no-underline hover:underline">
            {fact.sourceRoute}
          </a>
        ) : (
          <span className="font-mono text-[13px] text-muted-foreground">{fact.editedByUser ? 'edited by you' : 'not found'}</span>
        )}
        {fact.sourceQuote ? <span className="text-[13px] leading-normal text-muted-foreground italic">{fact.sourceQuote}</span> : null}
      </div>
    </div>
  );
}
