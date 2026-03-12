import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}
export default function PageContentWrapper({ children, className }: Props) {
  return (
    <div
      className={cn(
        ' bg-white rounded-2xl border border-neutral-gray-10 p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
