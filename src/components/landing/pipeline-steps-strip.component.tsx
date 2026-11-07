const STEPS = [
  { n: '01', t: 'Crawl', d: 'robots.txt, sitemap, llms.txt and up to 50 pages.' },
  { n: '02', t: 'Check', d: 'Bot access, schema, freshness, per page.' },
  { n: '03', t: 'Fact sheet', d: 'What your site says, with the quote and page for each fact.' },
  { n: '04', t: 'Questions', d: '20 buyer questions across six intents.' },
  { n: '05', t: 'Ask engines', d: 'Every question, with sources cited.' },
  { n: '06', t: 'Judge', d: 'Each answer checked against your fact sheet.' },
  { n: '07', t: 'Report', d: 'Score, the page each issue lives on, and the fix.' },
];

export function PipelineStepsStrip() {
  return (
    <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] overflow-hidden rounded-xl border border-border p-0">
      {STEPS.map(s => (
        <li
          key={s.n}
          className="flex flex-col gap-2 border-r border-b border-border bg-card p-5"
        >
          <span className="font-mono text-xs text-primary">{s.n}</span>
          <span className="text-[15px] font-semibold">{s.t}</span>
          <span className="text-[13px] leading-normal text-muted-foreground">
            {s.d}
          </span>
        </li>
      ))}
    </ol>
  );
}
