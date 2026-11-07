import { cva, type VariantProps } from 'class-variance-authority';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const monoChipVariants = cva(
  'rounded-full border-transparent px-2.5 py-1 font-mono text-xs font-normal uppercase',
  {
    variants: {
      tone: {
        muted: 'bg-subtle text-body',
        success: 'bg-subtle text-success',
        danger: 'bg-destructive-muted text-destructive-strong',
        dark: 'bg-surface-dark text-surface-dark-foreground',
        dashed: 'border-dashed border-chart-muted bg-transparent text-body',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
);

/** Small Fira Code pill: effort, lift, kind, "SNAPSHOT · 1 run". */
export function MonoChip({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof monoChipVariants>) {
  return (
    <Badge
      variant="outline"
      className={cn(monoChipVariants({ tone }), className)}
      {...props}
    />
  );
}
