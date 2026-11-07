'use client';

import { RefreshCw } from 'lucide-react';

import { ConfirmMarkText } from '@/components/aeo/confirm-mark.component';
import { CopyButton } from '@/components/aeo/copy-button.component';
import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { Button } from '@/components/ui/button';
import type { IFix } from '@/types/interfaces/fix.interface';

interface IDraftCopyCardProps {
  fix: IFix;
  canRegenerate: boolean;
  regenerating: boolean;
  onRegenerate: () => void;
}

/** Splits copy into paragraphs and "- " bullet lists. */
function DraftBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every(l => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="m-0 flex max-w-[680px] list-disc flex-col gap-1.5 pl-5 text-[17px] leading-[1.65]">
              {lines.map((l, j) => (
                <li key={j}>
                  <ConfirmMarkText text={l.trim().slice(2)} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="m-0 max-w-[680px] text-[17px] leading-[1.65]">
            <ConfirmMarkText text={block} />
          </p>
        );
      })}
    </>
  );
}

export function DraftCopyCard({ fix, canRegenerate, regenerating, onRegenerate }: IDraftCopyCardProps) {
  const body = fix.draftCopy ?? '';
  const copyText = fix.draftHeading ? `${fix.draftHeading}\n\n${body}` : body;
  return (
    <SurfaceCard aria-labelledby="draft-h" className="overflow-hidden" aria-busy={regenerating}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-5 py-3.5">
        <h2 id="draft-h" className="m-0 text-[15px] font-semibold">
          Draft copy{fix.draftWordCount ? ` · ${fix.draftWordCount} words` : ''}
        </h2>
        <div className="flex gap-2">
          {canRegenerate ? (
            <Button variant="outline" className="min-h-10 border-strong-border px-3.5 shadow-none" disabled={regenerating} onClick={onRegenerate}>
              <RefreshCw className={regenerating ? 'animate-spin' : undefined} aria-hidden />
              {regenerating ? 'Writing…' : 'Regenerate'}
            </Button>
          ) : null}
          <CopyButton value={copyText} className="px-3.5 font-semibold" />
        </div>
      </div>
      <div className={`flex flex-col gap-3 px-8 py-7 transition-opacity ${regenerating ? 'opacity-50' : ''}`}>
        {fix.draftHeading ? <h3 className="m-0 text-[22px] font-semibold">{fix.draftHeading}</h3> : null}
        <DraftBody text={body} />
      </div>
      {fix.notes.length ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-subtle bg-background px-5 py-3.5 text-[13px] text-muted-foreground">
          {fix.notes.map(n => (
            <span key={n}>{n}</span>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
