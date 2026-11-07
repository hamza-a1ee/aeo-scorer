import { MonoChip } from '@/components/aeo/mono-chip.component';
import type { TSubScore } from '@/types/enums/fix.enum';
import type { IFix } from '@/types/interfaces/fix.interface';

const SHORT: Record<TSubScore, string> = {
  visibility: 'VISIBILITY',
  accuracy: 'ACCURACY',
  reputation: 'REPUTATION',
  site_health: 'SITE HEALTH',
  content_readiness: 'CONTENT',
};

/** "+5 POINTS · VISIBILITY, CONTENT", effort, "GOES ON / · ABOVE THE FOLD". */
export function FixMetaChips({ fix }: { fix: IFix }) {
  const points = Math.max(0, Math.round(fix.liftPoints));
  return (
    <div className="flex flex-wrap gap-2">
      <MonoChip tone="success">
        {points ? `+${points} POINT${points === 1 ? '' : 'S'}` : '<1 POINT'} · {fix.subScores.map(s => SHORT[s]).join(', ')}
      </MonoChip>
      <MonoChip>{fix.effort}</MonoChip>
      <MonoChip>
        {fix.route === 'external' ? 'OFF-SITE' : `GOES ON ${fix.route}`}
        {fix.placement ? ` · ${fix.placement}` : ''}
      </MonoChip>
    </div>
  );
}
