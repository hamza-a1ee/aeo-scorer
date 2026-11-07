'use client';

import Link from 'next/link';

import { CompetitorChips } from '@/components/facts/competitor-chips.component';
import { FactGroup } from '@/components/facts/fact-group.component';
import { RatingGrid } from '@/components/facts/rating-grid.component';
import { AppHeader, HeaderLink } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { useAddCompetitor, useFactSheet, useRemoveCompetitor, useUpdateFact, useUpdateRating } from '@/query/fact-sheet.query';
import { useRejudge } from '@/query/scan.query';
import { parseError } from '@/utils/axios.util';

export function FactSheetView({ id }: { id: string }) {
  const { data, error, isPending } = useFactSheet(id);
  const updateFact = useUpdateFact(id);
  const addCompetitor = useAddCompetitor(id);
  const removeCompetitor = useRemoveCompetitor(id);
  const updateRating = useUpdateRating(id);
  const rejudge = useRejudge(id);
  const sheet = data?.data;
  const finished = sheet?.status === 'completed' || sheet?.status === 'partial';
  const origin = sheet ? `https://${sheet.domain}` : '';

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader rightSlot={<HeaderLink href={APP_ROUTES.scan(id)}>Back to the scan</HeaderLink>} />
      <main>
        <PageContainer className="flex flex-col gap-8 pt-12 pb-[120px]">
          {isPending ? (
            <div className="flex flex-col gap-6" aria-busy>
              <Skeleton className="h-28 w-2/3" />
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
          ) : null}

          {error && !sheet ? (
            <Alert variant="destructive">
              <AlertTitle>We could not load the fact sheet</AlertTitle>
              <AlertDescription>{parseError(error)}</AlertDescription>
            </Alert>
          ) : null}

          {sheet ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="flex max-w-[680px] flex-col gap-3">
                  <span className="font-mono text-sm text-muted-foreground">
                    {sheet.domain} · {sheet.factCount} facts from {sheet.pageCount} pages
                  </span>
                  <h1 className="m-0 text-[40px] leading-tight font-semibold tracking-[-0.02em]">Is this what your site says?</h1>
                  <p className="m-0 text-base leading-[1.55] text-muted-foreground">
                    We judge every engine answer against this sheet and build every fix from it. Each fact links to the page and
                    sentence it came from. Fix anything wrong; leave blanks blank. We will never guess a fact you have not confirmed.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {finished ? (
                    <Button className="min-h-12 px-[22px] text-[15px] font-semibold" disabled={sheet.readOnly || rejudge.isPending} onClick={() => rejudge.mutate()}>
                      {rejudge.isPending ? 'Re-judging…' : 'Save and re-judge answers'}
                    </Button>
                  ) : (
                    <Button asChild className="min-h-12 px-[22px] text-[15px] font-semibold">
                      <Link href={APP_ROUTES.scan(id)}>Save and continue the scan</Link>
                    </Button>
                  )}
                </div>
              </div>

              {sheet.readOnly ? (
                <Alert>
                  <AlertTitle>This is the sample fact sheet</AlertTitle>
                  <AlertDescription>Editing is turned off. Scan your own site to check and edit its facts.</AlertDescription>
                </Alert>
              ) : (
                <p className="-mt-4 text-[13px] text-muted-foreground" aria-live="polite">
                  {updateFact.isPending || updateRating.isPending || addCompetitor.isPending || removeCompetitor.isPending
                    ? 'Saving…'
                    : `Changes save when you leave a field. Fact sheet v${sheet.version}.${finished ? ' Re-judge to update the report.' : ' Judging uses the latest version.'}`}
                </p>
              )}

              {sheet.groups.map(g => (
                <FactGroup key={g.group} group={g} origin={origin} readOnly={sheet.readOnly} onSave={(factId, value) => updateFact.mutate({ factId, value })} />
              ))}

              <CompetitorChips
                competitors={sheet.competitors}
                readOnly={sheet.readOnly}
                onAdd={name => addCompetitor.mutate({ name })}
                onRemove={cid => removeCompetitor.mutate(cid)}
              />

              <RatingGrid ratings={sheet.ratings} readOnly={sheet.readOnly} onSave={payload => updateRating.mutate(payload)} />
            </>
          ) : null}
        </PageContainer>
      </main>
    </div>
  );
}
