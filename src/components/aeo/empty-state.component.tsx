import { SurfaceCard } from './surface-card.component';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <SurfaceCard className="items-start gap-2 p-6">
      <p className="m-0 font-semibold">{title}</p>
      {description ? (
        <p className="m-0 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </SurfaceCard>
  );
}
