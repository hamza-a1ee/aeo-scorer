'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

import { CodeBlock } from '@/components/aeo/code-block.component';
import { DraftCopyCard } from '@/components/fix/draft-copy-card.component';
import { FixMetaChips } from '@/components/fix/fix-meta-chips.component';
import { FixNav } from '@/components/fix/fix-nav.component';
import { AppHeader, HeaderLink } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES, SAMPLE_ID } from '@/constants/app-routes.constant';
import { useFix, useFixes, useRegenerateFix, useToggleFixDone } from '@/query/fix.query';
import { parseError } from '@/utils/axios.util';

const CODE_BADGE: Record<string, string> = {
  json: 'valid JSON · schema.org',
  text: 'robots.txt',
  markdown: 'llmstxt.org format',
};

export function FixView({ token, fixId }: { token: string; fixId: number }) {
  const fixes = useFixes(token);
  const { data, error, isPending } = useFix(token, fixId);
  const regenerate = useRegenerateFix(token, fixId);
  const toggleDone = useToggleFixDone(token, fixId);
  const fix = data?.data;
  const list = fixes.data?.data ?? [];
  const readOnly = token === SAMPLE_ID;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader rightSlot={<HeaderLink href={APP_ROUTES.report(token)}>Back to report</HeaderLink>} />
      <PageContainer className="flex flex-wrap items-start gap-8 pt-10 pb-24">
        {list.length ? <FixNav token={token} fixes={list} currentId={fixId} /> : <Skeleton className="h-80 max-w-[300px] flex-[1_1_240px]" />}

        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          {isPending ? (
            <div className="flex flex-col gap-4" aria-busy>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : null}

          {error && !fix ? (
            <Alert variant="destructive">
              <AlertTitle>We could not load this fix</AlertTitle>
              <AlertDescription>
                {parseError(error)}{' '}
                <Link href={APP_ROUTES.report(token)} className="underline">
                  Back to the report
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          {fix ? (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <FixMetaChips fix={fix} />
                  <Button
                    variant={fix.done ? 'default' : 'outline'}
                    size="sm"
                    className="min-h-9 border-strong-border shadow-none"
                    disabled={readOnly || toggleDone.isPending}
                    aria-pressed={fix.done}
                    onClick={() => toggleDone.mutate(!fix.done)}
                  >
                    <Check aria-hidden />
                    {fix.done ? 'Done' : 'Mark as done'}
                  </Button>
                </div>
                <h1 className="m-0 text-4xl leading-tight font-semibold tracking-[-0.02em]">{fix.title}</h1>
                {fix.gapDetail ? (
                  <p className="m-0 rounded-md border border-border bg-card px-4 py-3 text-[15px] leading-[1.55] text-body">
                    <span className="font-semibold">Closes this gap:</span> {fix.gapDetail}
                  </p>
                ) : null}
              </div>

              {fix.draftCopy ? (
                <DraftCopyCard fix={fix} canRegenerate={!readOnly} regenerating={regenerate.isPending} onRegenerate={() => regenerate.mutate()} />
              ) : null}

              {fix.codeBlock ? (
                <CodeBlock headingId="ld-h" title={fix.codeTitle ?? 'Code'} badge={CODE_BADGE[fix.codeLang ?? ''] ?? undefined} code={fix.codeBlock} />
              ) : null}

              {!fix.draftCopy && fix.notes.length ? (
                <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px] text-muted-foreground">
                  {fix.notes.map(n => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}

              {fix.unconfirmedCount ? (
                <p className="m-0 text-[13px] text-muted-foreground">
                  Red marks are facts you have not confirmed.{' '}
                  {readOnly ? null : (
                    <>
                      Fill them in on your fact sheet, then press Regenerate. The copy never guesses them.
                    </>
                  )}
                </p>
              ) : null}
            </>
          ) : null}
        </main>
      </PageContainer>
    </div>
  );
}
