import { SurfaceCard } from '@/components/aeo/surface-card.component';
import {
  SUB_SCORE_LABELS,
  SUB_SCORE_MAX,
} from '@/constants/scoring-weights.constant';
import { SUB_SCORES } from '@/types/enums/fix.enum';

export function ScorePartsGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
      {SUB_SCORES.map(key => {
        const meta = SUB_SCORE_LABELS[key];
        return (
          <SurfaceCard key={key} className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {meta.side}
              </span>
              <span className="text-2xl font-semibold">{SUB_SCORE_MAX[key]}</span>
            </div>
            <div className="text-[17px] font-semibold">{meta.name}</div>
            <div className="text-sm leading-normal text-muted-foreground">
              {meta.question}
            </div>
          </SurfaceCard>
        );
      })}
    </div>
  );
}
