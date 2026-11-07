import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { AppFooter } from '@/components/layout/app-footer.component';
import { AppHeader, HeaderLink } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { EFFORT_FACTOR } from '@/constants/fix-types.constant';
import { INTENT_DISTRIBUTION } from '@/constants/intents.constant';
import { GRADE_THRESHOLDS, SCORING_MODEL_VERSION, SUB_SCORE_LABELS, SUB_SCORE_MAX } from '@/constants/scoring-weights.constant';
import { SUB_SCORES } from '@/types/enums/fix.enum';

const FORMULAS: Record<(typeof SUB_SCORES)[number], string[]> = {
  visibility: [
    'Per engine: weighted mean of position across the buyer questions.',
    'Position: first 1.0, listed 0.6, absent 0.',
    'Category and task questions count ×2, because they do not name you.',
    'Mean over engines, times 25.',
  ],
  accuracy: [
    'Every claim about you is checked against your confirmed fact sheet: correct, wrong or unverifiable.',
    'Wrong pricing and feature claims count ×2.',
    '(1 − wrong weight ÷ all verifiable weight) × 25.',
    'Fewer than 3 verifiable claims: set to 20 and flagged “not enough data”.',
  ],
  reputation: [
    'Sentiment, 6 points: positive 1, neutral 0.6, negative 0.',
    'Ratings, 4 points: quoted rating matches the real one (±0.2) 1, missing 0.5, wrong 0. No ratings quoted: 2.',
    'Reported, never caps the grade. A low rating quoted correctly is accurate.',
  ],
  site_health: [
    'Each route scores 0–100: bot access 40, readable without JS 25, schema 20, freshness 15.',
    'Home and pricing count ×3 in the average. The average gives 20 points.',
    'Site checks give 5 points: llms.txt 40%, sitemap 30%, every AI bot allowed 30%.',
  ],
  content_readiness: [
    'Confirmed facts out of 23: 6 points.',
    'Plain description on the home page: 3. Numeric price on the pricing page: 3.',
    'A comparison page: 1.5. A FAQ page or FAQPage schema: 1.5.',
  ],
};

export function HowScoringWorksView({ crawlerUserAgent }: { crawlerUserAgent: string }) {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader rightSlot={<HeaderLink href={APP_ROUTES.sampleReport}>Sample report</HeaderLink>} />
      <main>
        <PageContainer className="flex flex-col gap-10 pt-12 pb-24">
          <div className="flex max-w-[720px] flex-col gap-3">
            <span className="font-mono text-sm text-muted-foreground">Scoring model v{SCORING_MODEL_VERSION}</span>
            <h1 className="m-0 text-[40px] leading-tight font-semibold tracking-[-0.02em]">How scoring works</h1>
            <p className="m-0 text-base leading-[1.55] text-muted-foreground">
              One score out of 100. 60 points come from what answer engines say about you. 40 come from your site, because that
              is the part you can change. Every weight is below, and the same inputs always give the same score.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
            {SUB_SCORES.map(key => (
              <SurfaceCard key={key} className="flex flex-col gap-3 p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="m-0 text-xl font-semibold">{SUB_SCORE_LABELS[key].name}</h2>
                  <span className="font-mono text-sm">
                    {SUB_SCORE_MAX[key]} pts · {SUB_SCORE_LABELS[key].side}
                  </span>
                </div>
                <p className="m-0 text-sm text-muted-foreground">{SUB_SCORE_LABELS[key].question}</p>
                <ul className="m-0 flex flex-col gap-1.5 pl-5 text-sm leading-normal text-body">
                  {FORMULAS[key].map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </SurfaceCard>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
            <SurfaceCard className="overflow-hidden">
              <h2 className="m-0 px-6 pt-5 pb-3 text-xl font-semibold">Grades</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-background hover:bg-background">
                    <TableHead className="px-6">Grade</TableHead>
                    <TableHead className="px-6">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GRADE_THRESHOLDS.map(([min, grade], i) => (
                    <TableRow key={grade} className="hover:bg-transparent">
                      <TableCell className="px-6 font-semibold">{grade}</TableCell>
                      <TableCell className="px-6 font-mono">
                        {i === 0 ? `${min} and up` : `${min}–${GRADE_THRESHOLDS[i - 1][0] - 1}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SurfaceCard>
            <SurfaceCard className="overflow-hidden">
              <h2 className="m-0 px-6 pt-5 pb-3 text-xl font-semibold">The 20 buyer questions</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-background hover:bg-background">
                    <TableHead className="px-6">Intent</TableHead>
                    <TableHead className="px-6">Questions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(INTENT_DISTRIBUTION).map(([intent, n]) => (
                    <TableRow key={intent} className="hover:bg-transparent">
                      <TableCell className="px-6 font-mono">
                        {intent}
                        {intent === 'category' || intent === 'task' ? ' ×2' : ''}
                      </TableCell>
                      <TableCell className="px-6 font-mono">{n}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SurfaceCard>
          </div>

          <SurfaceCard className="flex flex-col gap-3 p-6">
            <h2 className="m-0 text-xl font-semibold">How fixes are ranked</h2>
            <p className="m-0 text-sm leading-normal text-body">
              Each fix is tied to a measured gap. We re-run the score with that gap closed; the difference is the lift. Fixes are
              ranked by lift divided by effort (minutes {EFFORT_FACTOR.minutes}, hours {EFFORT_FACTOR.hours}, days {EFFORT_FACTOR.days}).
              The top three are shown first. Copy is written only from your confirmed facts; anything unconfirmed appears as a red
              [confirm: …] mark, never a guess.
            </p>
          </SurfaceCard>
        </PageContainer>
      </main>
      <AppFooter crawlerUserAgent={crawlerUserAgent} />
    </div>
  );
}
