import { cva, type VariantProps } from 'class-variance-authority';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const toneBadgeVariants = cva(
  'rounded-md border-transparent px-2 py-[3px] text-xs font-semibold',
  {
    variants: {
      tone: {
        good: 'bg-subtle text-success',
        bad: 'bg-destructive-muted text-destructive-strong',
        neutral: 'bg-subtle text-body',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type TTone = NonNullable<VariantProps<typeof toneBadgeVariants>['tone']>;

/** Status pill used for verdicts, positions and bot access. */
export function ToneBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof toneBadgeVariants>) {
  return (
    <Badge
      variant="outline"
      className={cn(toneBadgeVariants({ tone }), className)}
      {...props}
    />
  );
}
