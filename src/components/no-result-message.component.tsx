import { cn } from '@/lib/utils';

interface Props {
  message: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  className?: string;
}
export default function NoResultMessage({
  message,
  className,
  icon: Icon,
  description,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-20 w-full',
        className,
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="relative bg-linear-to-br from-primary/20 to-primary/5 rounded-full p-8 border border-primary/20">
          {Icon && typeof Icon === 'function' ? (
            <Icon className="text-primary size-16" />
          ) : (
            Icon
          )}
        </div>
      </div>
      <h3 className="text-primary-text text-xl font-semibold mb-2">
        {message ?? 'No results found'}
      </h3>
      <p className="text-gray-500 text-sm max-w-md text-center">
        {description ??
          ` Get started by uploading your first hazard perception video to begin
        creating interactive test scenarios.`}
      </p>
    </div>
  );
}
