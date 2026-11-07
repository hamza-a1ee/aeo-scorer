import type { TEngine, TIntent, TPosition } from '@/types/enums/answer.enum';
import type { IFix, IFixSummary } from '@/types/interfaces/fix.interface';
import type { IGapRow, IReport } from '@/types/interfaces/report.interface';

import { SAMPLE_ID } from './app-routes.constant';

/* Tallybook demo data, taken from the spec's Report and Fix artboards. */

const ENGINES: TEngine[] = ['gemini', 'chatgpt', 'perplexity'];
const LABEL: Record<TEngine, string> = { gemini: 'Gemini', chatgpt: 'ChatGPT', perplexity: 'Perplexity' };

let qid = 0;
const gap = (
  question: string,
  intent: TIntent,
  pos: TPosition | [TPosition, TPosition, TPosition],
  cited: string | null,
  shouldCite: string | null,
  why: string,
): IGapRow => {
  const list = Array.isArray(pos) ? pos : [pos, pos, pos];
  const rank = { absent: 0, listed: 1, first: 2 };
  return {
    questionId: ++qid,
    question,
    intent,
    doubled: intent === 'category' || intent === 'task',
    positions: ENGINES.map((e, i) => ({ engine: e, label: LABEL[e], position: list[i] })),
    worst: [...list].sort((a, b) => rank[a] - rank[b])[0],
    cited,
    shouldCite,
    why,
  };
};

const GAPS: IGapRow[] = [
  gap('best invoicing app for freelance designers', 'category', 'absent', null, '/', 'Home page never says “freelance designers”. Ledgerly’s page does.'),
  gap('how to send a late payment reminder automatically', 'task', 'absent', null, '/features/reminders', 'Page is 40 words with no steps. Answer-first how-to missing.'),
  gap('invoicing tools that take PayPal and Stripe', 'category', 'absent', null, '/integrations', 'Integrations listed as logos only. No text an engine can quote.'),
  gap('simple invoicing app for small studios', 'category', 'absent', null, 'No page covers this', 'No page targets studios. Fix: draft page.'),
  gap('invoicing software with automatic reminders', 'category', 'absent', null, '/features/reminders', 'Reminders page is too thin to be quoted.'),
  gap('how to set up recurring invoices for retainer clients', 'task', 'absent', null, '/features/recurring', 'Heading says “Set it and forget it”, never “recurring invoices”.'),
  gap('can Tallybook send payment reminders', 'feature', 'absent', null, '/features/reminders', 'Engines answered from Ledgerly’s docs instead.'),
  gap('does Tallybook support multiple currencies', 'feature', 'absent', null, '/features/currency', 'Currency page is an image of a list.'),
  gap('does Tallybook have a mobile app', 'feature', 'absent', null, '/download', 'Download page has App Store badge but no text.'),
  gap('Tallybook vs InvoiceKit', 'comparison', 'absent', null, 'No page covers this', 'No comparison page for InvoiceKit.'),
  gap('Ledgerly alternatives for freelancers', 'comparison', 'absent', null, '/compare/ledgerly', 'Comparison page has no facts table.'),
  gap('Tallybook complaints', 'reputation', 'absent', null, null, 'Engines had too little data and said so.'),
  gap('what is Tallybook', 'definition', ['first', 'listed', 'first'], '/blog/launch-2024', '/', 'Engine cited an old blog post because home has no definition.'),
  gap('Tallybook vs Ledgerly', 'comparison', 'listed', null, '/compare/ledgerly', 'Comparison page exists but has no facts table.'),
  gap('how to invoice a client in euros from the US', 'task', ['listed', 'listed', 'first'], '/features/currency', '/features/currency', 'Cited, but listed after two competitors.'),
  gap('what does Tallybook do', 'definition', 'first', '/', '/', 'Answered from the home page title.'),
  gap('is Tallybook free', 'definition', 'listed', '/pricing', '/pricing', 'Quoted the $15 monthly price only.'),
  gap('does Tallybook support recurring invoices', 'feature', 'listed', null, '/features/recurring', 'ChatGPT said recurring invoices are unsupported.'),
  gap('Tallybook reviews', 'reputation', 'first', null, null, 'Quoted G2 and the App Store.'),
  gap('is Tallybook any good', 'reputation', 'listed', null, null, 'Summarised Reddit threads.'),
];

const summary = (
  id: number,
  type: IFixSummary['type'],
  title: string,
  lift: number,
  effort: IFixSummary['effort'],
  route: string,
  gapText: string,
  why: string,
): IFixSummary => ({ id, type, rank: id, isTop3: id <= 3, title, liftPoints: lift, effort, route, gap: gapText, why, done: false });

const SUMMARIES: IFixSummary[] = [
  summary(1, 'robots_patch', 'Unblock GPTBot and CCBot in robots.txt', 6, 'minutes', '/robots.txt', 'GPTBot and CCBot blocked on every route', 'Line 14 blocks ChatGPT search from every page. Two lines to change.'),
  summary(2, 'definitional_paragraph', 'Add a “What is Tallybook?” paragraph to the home page', 5, 'minutes', '/', 'No plain “what is” answer on home', 'No plain definition above the fold. Gemini described you from a 2024 blog post instead.'),
  summary(3, 'feature_summary', 'Publish a page on automatic payment reminders', 4, 'hours', '/features/reminders', 'Absent from 3 task questions about reminders', 'Absent from 3 task questions about reminders. Your feature page is 40 words long.'),
  summary(4, 'product_jsonld', 'Add Product and Offer JSON-LD to /pricing', 3, 'minutes', '/pricing', 'Pricing has no machine-readable prices', '/pricing has no machine-readable prices, so engines guess them from text. 2 answers got your price wrong.'),
  summary(5, 'llms_txt', 'Publish an llms.txt file', 3, 'minutes', '/llms.txt', 'File missing at site root', 'No /llms.txt at the site root. It hands engines a plain summary and your key pages.'),
  summary(6, 'feature_summary', 'Correct what engines say about Recurring invoices', 3, 'hours', '/features/recurring', 'Engine said recurring invoices are unsupported', 'ChatGPT said “Tallybook does not support recurring invoices.” Your site says: Yes, weekly, monthly or custom.'),
  summary(7, 'rating_fix', 'Show your real App Store rating on /reviews', 2, 'hours', '/reviews', 'App Store rating quoted as 3.9, real 4.4', 'Engines quote your App Store rating as 3.9; the real rating is 4.4.'),
  summary(8, 'directory_checklist', 'List Tallybook on Capterra and Trustpilot', 2, 'days', 'external', 'No Capterra or Trustpilot listing', 'Engines lean on review sites and roundups for category questions. You have no Capterra or Trustpilot listing.'),
];

const JSONLD = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tallybook",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS",
  "description": "Invoicing software for freelancers and small studios.",
  "offers": [
    { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "[confirm: paid tier name]", "price": "12", "priceCurrency": "USD" }
  ],
  "aggregateRating": {
    "@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": "128"
  }
}
</script>`;

const detail: Record<number, Omit<IFix, keyof IFixSummary>> = {
  1: {
    subScores: ['site_health'],
    placement: 'Site root',
    draftCopy: null,
    draftHeading: null,
    draftWordCount: null,
    notes: ['Replace the file at your site root', 'Allows GPTBot, CCBot', 'Keeps your other rules as they are'],
    codeBlock: `User-agent: *\nDisallow: /admin\nDisallow: /api\n\nUser-agent: GPTBot\n# Disallow: /  (removed: lets AI answer engines read the site)\nAllow: /\n\nUser-agent: CCBot\n# Disallow: /  (removed: lets AI answer engines read the site)\nAllow: /\n\nSitemap: https://tallybook.app/sitemap.xml\n`,
    codeLang: 'text',
    codeTitle: 'Patched robots.txt',
    gapDetail: 'GPTBot and CCBot are blocked on every route, so ChatGPT search cannot read any page on tallybook.app.',
    unconfirmedCount: 0,
    regenerations: 0,
  },
  2: {
    subScores: ['visibility', 'content_readiness'],
    placement: 'Above the fold',
    draftHeading: 'What is Tallybook?',
    draftCopy:
      'Tallybook is invoicing software for freelancers and studios with fewer than 10 people. It sends invoices, repeats them on a schedule, and reminds late clients automatically, up to three times per invoice. Clients pay by Stripe or PayPal in 40 currencies. Tallybook runs on the web and iOS. It is free for up to 3 clients; the [confirm: paid tier name] plan costs $12 per month billed annually or $15 month to month.',
    draftWordCount: 74,
    notes: ['Every fact from your fact sheet', 'No marketing adjectives', '1 blank to confirm'],
    codeBlock: JSONLD,
    codeLang: 'json',
    codeTitle: 'Paste with it: SoftwareApplication JSON-LD',
    gapDetail: 'Asked “what is Tallybook”, Gemini quoted your 2024 launch post and called you “a time-tracking tool”, because your home page has no plain definition.',
    unconfirmedCount: 2,
    regenerations: 0,
  },
  3: {
    subScores: ['visibility', 'accuracy'],
    placement: 'Top of page',
    draftHeading: 'Automatic payment reminders',
    draftCopy:
      'Yes. Tallybook reminds late clients automatically. When an invoice passes its due date, Tallybook emails the client a reminder with a link to pay by Stripe or PayPal. You can send up to 3 reminders per invoice and choose how many days apart they go out. Reminders stop as soon as the invoice is paid. Reminders are included on the free plan for up to 3 clients and on the [confirm: paid tier name] plan.',
    draftWordCount: 79,
    notes: ['Every fact from your fact sheet', 'No marketing adjectives', '1 blank to confirm'],
    codeBlock: null,
    codeLang: null,
    codeTitle: null,
    gapDetail: 'Asked “how to send a late payment reminder automatically”, all three engines named Ledgerly and InvoiceKit. Your reminders page is 40 words with no steps.',
    unconfirmedCount: 1,
    regenerations: 0,
  },
  4: {
    subScores: ['site_health', 'accuracy'],
    placement: 'In <head>',
    draftCopy: null,
    draftHeading: null,
    draftWordCount: null,
    notes: ['Paste inside <head>', 'Prices match your fact sheet', '1 blank to confirm'],
    codeBlock: JSONLD,
    codeLang: 'json',
    codeTitle: 'SoftwareApplication + Offer JSON-LD',
    gapDetail: 'Asked “how much does Tallybook cost”, ChatGPT said Pro costs $15 per month. The $12 annual price is in a client-side table engines cannot read.',
    unconfirmedCount: 1,
    regenerations: 0,
  },
  5: {
    subScores: ['site_health', 'content_readiness'],
    placement: 'Site root',
    draftCopy: null,
    draftHeading: null,
    draftWordCount: null,
    notes: ['Save as /llms.txt at the site root', 'Facts come from your fact sheet', 'Nothing to confirm'],
    codeBlock: `# Tallybook\n\n> Invoicing and payment reminders for freelancers and small studios\n\nTallybook is invoicing software for Freelancers and studios under 10 people. It runs on Web, iOS.\nPricing: Free · 3 clients. Paid plan: $12 per month.\n\n## Features\n\n- Recurring invoices: Yes, weekly, monthly or custom\n- Automatic reminders: Yes, up to 3 per invoice\n- Payments: Stripe and PayPal\n- Multi-currency: Yes, 40 currencies\n\n## Key pages\n\n- [Tallybook](https://tallybook.app/)\n- [Pricing](https://tallybook.app/pricing)\n- [Recurring invoices](https://tallybook.app/features/recurring)\n- [Payment reminders](https://tallybook.app/features/reminders)\n- [Tallybook vs Ledgerly](https://tallybook.app/compare/ledgerly)\n`,
    codeLang: 'markdown',
    codeTitle: 'llms.txt',
    gapDetail: 'No /llms.txt at the site root.',
    unconfirmedCount: 0,
    regenerations: 0,
  },
  6: {
    subScores: ['visibility', 'accuracy'],
    placement: 'Top of page',
    draftHeading: 'Recurring invoices',
    draftCopy:
      'Yes. Tallybook supports recurring invoices. Set any invoice to repeat weekly, monthly or on a custom schedule, and Tallybook sends each one on the date you choose. Recurring invoices work with automatic reminders and with Stripe and PayPal payments. They are available on the web and iOS.',
    draftWordCount: 48,
    notes: ['Every fact from your fact sheet', 'No marketing adjectives', 'Nothing to confirm'],
    codeBlock: null,
    codeLang: null,
    codeTitle: null,
    gapDetail: 'Asked “does Tallybook support recurring invoices”, ChatGPT said it does not. Your page heading reads “Set it and forget it” and never names the feature.',
    unconfirmedCount: 0,
    regenerations: 0,
  },
  7: {
    subScores: ['reputation'],
    placement: 'Reviews section',
    draftHeading: 'Ratings and reviews',
    draftCopy: 'Tallybook is rated 4.6 out of 5 on G2 from 128 reviews and 4.4 out of 5 on the App Store from 2,100 ratings.',
    draftWordCount: 23,
    notes: ['Every fact from your fact sheet', 'No marketing adjectives', 'Nothing to confirm'],
    codeBlock: null,
    codeLang: null,
    codeTitle: null,
    gapDetail: 'Engines quote your App Store rating as 3.9, an old figure from 2024. The real rating is 4.4.',
    unconfirmedCount: 0,
    regenerations: 0,
  },
  8: {
    subScores: ['visibility', 'reputation'],
    placement: null,
    draftHeading: 'Directory checklist',
    draftCopy:
      '- Claim or create your Capterra listing: https://vendors.capterra.com\n- Claim or create your Trustpilot listing: https://business.trustpilot.com\n- Use the same one-line description on every listing as on your home page.\n- Ask 10 recent customers for a review on the listing you create first.\n- Pitch an update to “Best invoicing apps for freelancers” on Zapier’s blog, which engines cite for your category.',
    draftWordCount: 62,
    notes: ['2 listings to create', 'Takes days, not minutes'],
    codeBlock: null,
    codeLang: null,
    codeTitle: null,
    gapDetail: 'Category answers cite G2 and Capterra roundups. Ledgerly is listed on both; Tallybook is on G2 only.',
    unconfirmedCount: 0,
    regenerations: 0,
  },
};

export const SAMPLE_FIXES: IFix[] = SUMMARIES.map(s => ({ ...s, ...detail[s.id] }));

const bots = (allowed: number) => `${allowed} of 6 bots`;

export const SAMPLE_REPORT: IReport = {
  token: SAMPLE_ID,
  domain: 'tallybook.app',
  brandName: 'Tallybook',
  status: 'completed',
  finishedAt: '2026-11-07T14:26:00.000Z',
  modelVersion: '1.0',
  engines: ENGINES,
  score: {
    total: 58,
    grade: 'C',
    isPartial: false,
    passes: 1,
    subScores: [
      { key: 'visibility', name: 'Visibility', description: 'mentioned when it should be', value: 9, max: 25 },
      { key: 'accuracy', name: 'Accuracy', description: 'facts engines get right', value: 17, max: 25 },
      { key: 'reputation', name: 'Reputation', description: 'sentiment and ratings', value: 6, max: 10 },
      { key: 'site_health', name: 'Site health', description: 'AI crawlers can read it', value: 16, max: 25 },
      { key: 'content_readiness', name: 'Content readiness', description: 'site states the facts', value: 10, max: 15 },
    ],
    byEngine: [
      { engine: 'gemini', label: 'Gemini', total: 58 },
      { engine: 'chatgpt', label: 'ChatGPT', total: 51 },
      { engine: 'perplexity', label: 'Perplexity', total: 65 },
    ],
  },
  topFixes: SUMMARIES.filter(f => f.isTop3),
  gaps: {
    summary: 'Mentioned in 8 of 20 answers. Absent from 6 of 7 category and task questions, which count double.',
    rows: GAPS,
  },
  citations: {
    engines: [
      { engine: 'perplexity', label: 'Perplexity', rate: 40, cited: 8, total: 20, topPage: '/pricing', isTop: true },
      { engine: 'gemini', label: 'Gemini', rate: 30, cited: 6, total: 20, topPage: '/', isTop: false },
      { engine: 'chatgpt', label: 'ChatGPT', rate: 15, cited: 3, total: 20, topPage: '/blog/launch-2024', isTop: false },
    ],
    sources: [
      { key: 'your_site', label: 'Your site', byEngine: { gemini: 30, chatgpt: 15, perplexity: 40 } },
      { key: 'competitor_sites', label: 'Competitor sites', byEngine: { gemini: 25, chatgpt: 30, perplexity: 20 } },
      { key: 'reddit_forums', label: 'Reddit and forums', byEngine: { gemini: 20, chatgpt: 25, perplexity: 15 } },
      { key: 'review_sites', label: 'Review sites (G2, Capterra)', byEngine: { gemini: 15, chatgpt: 20, perplexity: 10 } },
      { key: 'roundups', label: 'Roundups and directories', byEngine: { gemini: 5, chatgpt: 5, perplexity: 10 } },
      { key: 'other', label: 'Other', byEngine: { gemini: 5, chatgpt: 5, perplexity: 5 } },
    ],
    pages: [
      { route: '/pricing', pct: 38, note: 'Cited by Perplexity and Gemini', flagged: false },
      { route: '/', pct: 27, note: 'Cited by all three', flagged: false },
      { route: '/blog/launch-2024', pct: 20, note: 'Stale post from 2024, describes you as time tracking', flagged: true },
      { route: '/features/recurring', pct: 15, note: 'Cited by Perplexity only', flagged: false },
    ],
  },
  accuracy: {
    summary: '31 claims about Tallybook: 24 correct, 4 wrong, 3 unverifiable. Wrong pricing and feature claims cost double.',
    wrong: [
      { kind: 'pricing', doubled: true, said: 'Tallybook Pro costs $15 per month.', engineLabel: 'ChatGPT', question: 'how much does Tallybook cost', truth: '$12/month billed annually; $15 month-to-month.', source: '/pricing', correction: 'State both prices in one sentence in raw HTML, and add Offer JSON-LD for each.' },
      { kind: 'feature', doubled: true, said: 'Tallybook does not support recurring invoices.', engineLabel: 'ChatGPT', question: 'does Tallybook support recurring invoices', truth: 'Recurring invoices on any schedule.', source: '/features/recurring', correction: 'Replace the heading “Set it and forget it” with “Recurring invoices” and open with one plain sentence.' },
      { kind: 'platform', doubled: false, said: 'Tallybook is available on iOS and Android.', engineLabel: 'Gemini', question: 'Tallybook mobile app', truth: 'Web and iOS only.', source: '/download', correction: 'Add “There is no Android app yet.” to /download.' },
    ],
  },
  reputation: {
    title: 'Reputation, as Gemini tells it',
    sentiment: { positive: 3, neutral: 2, negative: 1, total: 6 },
    negativeLine: 'users report the mobile app lags behind the web version',
    ratings: [
      { platform: 'g2', label: 'G2', quoted: '4.6', real: '4.6', verdict: 'matches' },
      { platform: 'app_store', label: 'App Store', quoted: '3.9', real: '4.4', verdict: 'wrong' },
      { platform: 'capterra', label: 'Capterra', quoted: null, real: 'no listing', verdict: 'missing' },
    ],
    themes: [
      { text: 'Simple setup', tone: 'positive' },
      { text: 'Good reminders', tone: 'positive' },
      { text: 'Mobile app lag', tone: 'negative' },
      { text: 'No time tracking', tone: 'negative' },
    ],
    reviewSources: ['G2', 'App Store', 'Reddit r/freelance'],
  },
  siteHealth: {
    summary: '38 routes crawled. Home and pricing count 3× in the average.',
    bots: [
      { name: 'GPTBot', allowed: false },
      { name: 'ClaudeBot', allowed: true },
      { name: 'PerplexityBot', allowed: true },
      { name: 'Google-Extended', allowed: true },
      { name: 'Bingbot', allowed: true },
      { name: 'CCBot', allowed: false },
    ],
    routes: [
      {
        route: '/', type: 'home', access: bots(4), accessOk: false, readable: true, schema: 'Organization', lastUpdated: null, stale: true, issueCount: 3,
        issues: [
          { code: 'BOTS_BLOCKED', label: 'robots.txt:14', detail: 'User-agent: GPTBot / Disallow: / · blocks ChatGPT search from every page' },
          { code: 'MISSING_EXPECTED_SCHEMA', label: 'schema', detail: 'No SoftwareApplication JSON-LD.' },
          { code: 'NO_DATE', label: 'freshness', detail: 'No visible or machine-readable last-updated date.' },
        ],
      },
      {
        route: '/pricing', type: 'pricing', access: bots(4), accessOk: false, readable: false, schema: 'none', lastUpdated: null, stale: true, issueCount: 3,
        issues: [
          { code: 'BOTS_BLOCKED', label: 'robots.txt:14', detail: 'User-agent: GPTBot / Disallow: / · blocks ChatGPT search from every page' },
          { code: 'NO_SCHEMA', label: 'schema', detail: 'No Product + Offer JSON-LD. Engines cannot read the $12 / $15 split.' },
          { code: 'PRICE_NOT_IN_HTML', label: 'no-JS render', detail: 'Price table is built client-side; raw HTML has no prices.' },
        ],
      },
      {
        route: '/features/recurring', type: 'feature', access: bots(4), accessOk: false, readable: true, schema: 'none', lastUpdated: 'Mar 2026', stale: false, issueCount: 2,
        issues: [
          { code: 'BOTS_BLOCKED', label: 'robots.txt:14', detail: 'GPTBot, CCBot blocked' },
          { code: 'NO_SCHEMA', label: 'schema', detail: 'No JSON-LD or microdata.' },
        ],
      },
      {
        route: '/features/reminders', type: 'feature', access: bots(4), accessOk: false, readable: true, schema: 'none', lastUpdated: 'Aug 2024', stale: true, issueCount: 3,
        issues: [
          { code: 'BOTS_BLOCKED', label: 'robots.txt:14', detail: 'GPTBot, CCBot blocked' },
          { code: 'THIN_CONTENT', label: 'thin content', detail: 'Only 40 words of text.' },
          { code: 'STALE_CONTENT', label: 'freshness', detail: 'Last updated 820 days ago.' },
        ],
      },
      {
        route: '/compare/ledgerly', type: 'comparison', access: bots(4), accessOk: false, readable: true, schema: 'none', lastUpdated: 'Jun 2026', stale: false, issueCount: 1,
        issues: [{ code: 'BOTS_BLOCKED', label: 'robots.txt:14', detail: 'GPTBot, CCBot blocked' }],
      },
      { route: '/about', type: 'about', access: bots(4), accessOk: false, readable: true, schema: 'Organization', lastUpdated: 'Jan 2026', stale: false, issueCount: 0, issues: [] },
    ],
  },
  shareOfVoice: {
    summary: 'Share of all app mentions across the 20 answers · Gemini',
    items: [
      { name: 'Ledgerly', pct: 42, isUs: false },
      { name: 'Tallybook', pct: 27, isUs: true },
      { name: 'InvoiceKit', pct: 19, isUs: false },
      { name: 'Paystub Pro', pct: 12, isUs: false },
    ],
  },
  fixes: SUMMARIES,
  runDetails: [
    { label: 'Engines', value: 'Gemini, ChatGPT, Perplexity' },
    { label: 'Questions', value: '20 · 6 intents' },
    { label: 'Routes crawled', value: '38 of 50 cap' },
    { label: 'Passes', value: '1 · snapshot' },
    { label: 'Scoring model', value: 'v1.0' },
    { label: 'Finished', value: '7 Nov 2026, 14:26' },
  ],
};
