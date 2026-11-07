import { cn } from '@/lib/utils';

interface ISectionHeadingProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  size?: 'lg' | 'md';
  className?: string;
}

export function SectionHeading({
  id,
  title,
  description,
  aside,
  size = 'lg',
  className,
}: ISectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-3',
        className,
      )}
    >
      <div>
        <h2
          id={id}
          className={cn(
            'm-0 font-semibold tracking-[-0.01em]',
            size === 'lg' ? 'text-[28px]' : 'text-xl',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {aside}
    </div>
  );
}
