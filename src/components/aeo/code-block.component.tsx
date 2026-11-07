import { cn } from '@/lib/utils';

import { CopyButton } from './copy-button.component';

interface ICodeBlockProps {
  title: string;
  badge?: string;
  code: string;
  className?: string;
  headingId?: string;
}

/** Dark code card with a copy button (JSON-LD, robots.txt, llms.txt). */
export function CodeBlock({ title, badge, code, className, headingId }: ICodeBlockProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn('overflow-hidden rounded-xl bg-surface-dark', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-dark-border px-5 py-3.5">
        <div className="flex items-center gap-3">
          <h2 id={headingId} className="m-0 text-[15px] font-semibold text-surface-dark-foreground">
            {title}
          </h2>
          {badge ? (
            <span className="font-mono text-xs text-surface-dark-muted">{badge}</span>
          ) : null}
        </div>
        <CopyButton
          value={code}
          variant="outline"
          className="border-body bg-transparent text-surface-dark-foreground hover:bg-surface-dark-border hover:text-surface-dark-foreground"
        />
      </div>
      <pre className="m-0 overflow-x-auto px-6 py-5 font-mono text-[13px] leading-[1.7] text-border">
        <ConfirmCode code={code} />
      </pre>
    </section>
  );
}

/** Highlights [confirm: …] tokens inside code. */
function ConfirmCode({ code }: { code: string }) {
  const parts = code.split(/(\[confirm:[^\]]*\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[confirm:') ? (
          <span key={i} className="text-destructive-border">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
