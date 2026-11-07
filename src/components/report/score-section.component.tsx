import { MonoChip } from '@/components/aeo/mono-chip.component';
import { ScoreRing } from '@/components/aeo/score-ring.component';
import { SubScoreBar } from '@/components/aeo/sub-score-bar.component';
import type { IReport } from '@/types/interfaces/report.interface';

/** 1 · Score card: ring, grade, five sub-scores, score by engine. */
export function ScoreSection({ score }: { score: IReport['score'] }) {
  return (
    <section id="score" aria-labelledby="score-h" className="flex scroll-mt-6 flex-wrap items-center gap-10 rounded-2xl border border-border bg-card p-8">
      <h2 id="score-h" className="sr-only">
        Score
      </h2>
      <div className="flex shrink-0 flex-col items-center gap-3">
        <ScoreRing score={score.total} grade={score.grade} />
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-subtle px-3.5 py-1 text-xl font-bold" aria-label={`Grade ${score.grade}`}>
            {score.grade}
          </span>
          <MonoChip tone="dashed" className="normal-case">
            {score.isPartial ? 'PARTIAL' : 'SNAPSHOT'} · {score.passes} run
          </MonoChip>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[18px]">
        {score.subScores.map(s => (
          <SubScoreBar key={s.key} name={s.name} description={s.description} value={s.value} max={s.max} />
        ))}
      </div>
      {score.byEngine.length ? (
        <div className="flex basis-full flex-wrap items-center gap-3 border-t border-subtle pt-6">
          <span className="mr-2 text-[13px] text-muted-foreground">Score by engine</span>
          {score.byEngine.map(e => (
            <span key={e.engine} className="inline-flex items-center gap-2 rounded-md bg-subtle px-3.5 py-2 text-sm">
              <span className="font-semibold">{e.label}</span>
              <span className="font-mono">{e.total}</span>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
