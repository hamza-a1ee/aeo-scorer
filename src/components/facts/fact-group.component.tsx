import { SurfaceCard } from '@/components/aeo/surface-card.component';
import type { IFactGroupView } from '@/types/interfaces/fact-sheet.interface';

import { FactRow } from './fact-row.component';

interface IFactGroupProps {
  group: IFactGroupView;
  origin: string;
  readOnly: boolean;
  onSave: (factId: number, value: string | null) => void;
}

export function FactGroup({ group, origin, readOnly, onSave }: IFactGroupProps) {
  const headingId = `group-${group.group}`;
  return (
    <SurfaceCard aria-labelledby={headingId} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-6 py-4">
        <h2 id={headingId} className="m-0 text-xl font-semibold">
          {group.title}
        </h2>
        <span className="text-[13px] text-muted-foreground">{group.hint}</span>
      </div>
      {group.facts.length ? (
        group.facts.map(f => (
          <FactRow key={f.id} fact={f} origin={origin} readOnly={readOnly} onSave={value => onSave(f.id, value)} />
        ))
      ) : (
        <p className="m-0 px-6 py-4 text-sm text-muted-foreground">Nothing found on the site for this group.</p>
      )}
    </SurfaceCard>
  );
}
