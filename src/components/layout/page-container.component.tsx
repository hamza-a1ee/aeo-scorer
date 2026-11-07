import { cn } from '@/lib/utils';

export function PageContainer({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1200px] px-6', className)}
      {...props}
    />
  );
}
