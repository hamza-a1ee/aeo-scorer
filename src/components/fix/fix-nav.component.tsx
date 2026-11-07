import Link from 'next/link';

import { formatLift } from '@/components/report/top-fixes-section.component';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { FIX_TYPE_META } from '@/constants/fix-types.constant';
import { cn } from '@/lib/utils';
import type { IFixSummary } from '@/types/interfaces/fix.interface';

/** Short label; a second fix of the same type is named after its page. */
export function fixNavLabel(fix: IFixSummary, all: IFixSummary[]): string {
  const meta = FIX_TYPE_META[fix.type];
  const first = all.find(f => f.type === fix.type);
  if (!first || first.id === fix.id) return meta.shortTitle;
  const last = fix.route.split('/').filter(Boolean).pop();
  return last ? `${last.charAt(0).toUpperCase()}${last.slice(1).replace(/-/g, ' ')} page` : meta.shortTitle;
}

interface IFixNavProps {
  token: string;
  fixes: IFixSummary[];
  currentId: number;
}

export function FixNav({ token, fixes, currentId }: IFixNavProps) {
  return (
    <nav aria-label="Fixes" className="flex max-w-[300px] flex-[1_1_240px] flex-col gap-1 max-md:max-w-none">
      <span className="px-3 pb-2 text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">{fixes.length} fixes</span>
      {fixes.map(f => {
        const current = f.id === currentId;
        return (
          <Link
            key={f.id}
            href={APP_ROUTES.fix(token, f.id)}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground no-underline hover:bg-card',
              current && 'bg-card font-semibold',
            )}
          >
            <span
              className={cn('size-4 shrink-0 rounded-full border-2', f.done ? 'border-primary bg-primary' : 'border-strong-border bg-transparent')}
              aria-label={f.done ? 'Done' : undefined}
            />
            <span className="flex-auto">{fixNavLabel(f, fixes)}</span>
            <span className="font-mono text-xs text-muted-foreground">{formatLift(f.liftPoints)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
