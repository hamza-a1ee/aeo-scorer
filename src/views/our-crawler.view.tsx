import { SurfaceCard } from '@/components/aeo/surface-card.component';
import { AppFooter } from '@/components/layout/app-footer.component';
import { AppHeader, HeaderLink } from '@/components/layout/app-header.component';
import { PageContainer } from '@/components/layout/page-container.component';
import { APP_ROUTES } from '@/constants/app-routes.constant';
import { AI_BOTS } from '@/constants/bots.constant';

interface IOurCrawlerViewProps {
  crawlerUserAgent: string;
  maxPages: number;
}

export function OurCrawlerView({ crawlerUserAgent, maxPages }: IOurCrawlerViewProps) {
  const name = crawlerUserAgent.split('/')[0];
  const facts = [
    { title: 'What it fetches', body: `robots.txt, sitemap.xml, llms.txt and at most ${maxPages} pages on the address you scan. Home, pricing, features, comparison, about, docs and FAQ pages come first.` },
    { title: 'robots.txt', body: `It reads your robots.txt first and skips every path that disallows ${name}. It never fetches a page it is told not to.` },
    { title: 'Pace', body: 'Four requests at a time at most, with a pause between them, a 10 second timeout and a 2 MB cap per page. One scan per domain per day.' },
    { title: 'Same site only', body: 'It follows links and redirects on your own domain only, and never fetches private or internal network addresses.' },
    { title: 'What it checks', body: `Whether ${AI_BOTS.join(', ')} may read each page, whether the text is readable without JavaScript, structured data, and last-updated dates.` },
    { title: 'What it keeps', body: 'Page text, titles, headings and structured data, used to build your fact sheet and report. Nothing behind a login.' },
  ];
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader rightSlot={<HeaderLink href={APP_ROUTES.home}>Scan a site</HeaderLink>} />
      <main>
        <PageContainer className="flex flex-col gap-10 pt-12 pb-24">
          <div className="flex max-w-[720px] flex-col gap-3">
            <h1 className="m-0 text-[40px] leading-tight font-semibold tracking-[-0.02em]">Our crawler</h1>
            <p className="m-0 text-base leading-[1.55] text-muted-foreground">
              When someone scans a site, AEO App fetches a small number of its public pages. It identifies itself with this user agent:
            </p>
            <code className="w-fit rounded-md bg-surface-dark px-3 py-2 font-mono text-sm text-surface-dark-foreground">{crawlerUserAgent}</code>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {facts.map(f => (
              <SurfaceCard key={f.title} className="flex flex-col gap-2 p-6">
                <h2 className="m-0 text-lg font-semibold">{f.title}</h2>
                <p className="m-0 text-sm leading-normal text-body">{f.body}</p>
              </SurfaceCard>
            ))}
          </div>
          <SurfaceCard className="flex flex-col gap-3 p-6">
            <h2 className="m-0 text-lg font-semibold">Block it</h2>
            <p className="m-0 text-sm text-body">Add this to your robots.txt and scans of your site will skip every page:</p>
            <pre className="m-0 w-fit rounded-md bg-subtle px-4 py-3 font-mono text-[13px]">{`User-agent: ${name}\nDisallow: /`}</pre>
          </SurfaceCard>
        </PageContainer>
      </main>
      <AppFooter crawlerUserAgent={crawlerUserAgent} />
    </div>
  );
}
