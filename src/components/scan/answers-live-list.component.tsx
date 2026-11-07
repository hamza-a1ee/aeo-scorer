import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { VerdictBadge } from '@/components/aeo/verdict-badge.component';
import type { IScanStatus } from '@/types/interfaces/scan.interface';

interface IAnswersLiveListProps {
  answers: IScanStatus['answersSoFar'];
  progress: IScanStatus['answersProgress'];
}

/** Latest answers with a live verdict while the engines stage runs. */
export function AnswersLiveList({ answers, progress }: IAnswersLiveListProps) {
  return (
    <SurfaceCard aria-labelledby="live-h" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-subtle px-5 py-4">
        <h2 id="live-h" className="m-0 text-[15px] font-semibold">
          Answers so far
        </h2>
        {progress ? (
          <span className="font-mono text-[13px] text-muted-foreground">
            {progress.done} / {progress.total} · {progress.engineLabel}
          </span>
        ) : null}
      </div>
      {answers.length ? (
        <ul className="m-0 list-none p-0" aria-live="polite">
          {answers.map(a => (
            <li key={a.id} className="flex items-baseline gap-3 border-t border-subtle px-5 py-3 text-sm first:border-t-0">
              <span className="w-[92px] shrink-0 font-mono text-xs text-muted-foreground">{a.intent}</span>
              <span className="min-w-0 flex-auto">{a.question}</span>
              <VerdictBadge verdict={a.verdict} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 px-5 py-4 text-sm text-muted-foreground">Answers show up here as each engine replies.</p>
      )}
    </SurfaceCard>
  );
}
