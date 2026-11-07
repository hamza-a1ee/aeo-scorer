import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * The white, bordered, 12px-radius panel used across every screen.
 * Built on shadcn Card with the spec's flat look (no shadow, no padding).
 */
export function SurfaceCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('gap-0 rounded-xl py-0 shadow-none', className)}
      {...props}
    />
  );
}
