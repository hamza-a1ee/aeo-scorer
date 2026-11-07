import Link from 'next/link';

import { AppHeader } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <PageContainer className="flex flex-col items-start gap-4 py-24">
        <span className="font-mono text-sm text-muted-foreground">404</span>
        <h1 className="m-0 text-[40px] font-semibold tracking-[-0.02em]">
          We could not find that page
        </h1>
        <p className="m-0 max-w-[560px] text-muted-foreground">
          The scan or report may have expired, or the link is mistyped.
        </p>
        <Button asChild className="min-h-11 px-5">
          <Link href="/">Scan a site</Link>
        </Button>
      </PageContainer>
    </div>
  );
}
