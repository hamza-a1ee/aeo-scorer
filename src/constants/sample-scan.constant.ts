import type { IFactSheet } from '@/types/interfaces/fact-sheet.interface';
import type { IScanStatus } from '@/types/interfaces/scan.interface';

import { SAMPLE_ID } from './app-routes.constant';

/** Read-only demo of the Run page, mid-scan (spec: Run artboard). */
export function sampleScanStatus(): IScanStatus {
  return {
    id: SAMPLE_ID,
    domain: 'tallybook.app',
    brandName: 'Tallybook',
    status: 'running',
    currentStage: 'engines',
    stageTitle: 'Asking Gemini your buyer questions',
    stageOrder: 5,
    progressPct: 66,
    startedAt: new Date(Date.now() - 158_000).toISOString(),
    completedAt: null,
    stages: [
      { stage: 'crawl', order: 1, title: 'Crawl', description: 'robots.txt, sitemap.xml, llms.txt (missing), 38 routes classified.', status: 'done', meta: '0:41' },
      { stage: 'health', order: 2, title: 'Site health checks', description: 'Bot access, schema, freshness on every route.', status: 'done', meta: '0:08' },
      { stage: 'facts', order: 3, title: 'Fact sheet', description: 'Read home, pricing, 6 feature pages and about.', status: 'done', meta: '0:37' },
      { stage: 'questions', order: 4, title: 'Buyer questions', description: '20 questions across six intents.', status: 'done', meta: '0:12' },
      { stage: 'engines', order: 5, title: 'Ask engines', description: 'Gemini with grounding, one pass.', status: 'running', meta: '12 / 20' },
      { stage: 'judge', order: 6, title: 'Judge answers', description: 'Each answer checked against the fact sheet.', status: 'pending', meta: '—' },
      { stage: 'report', order: 7, title: 'Score and draft fixes', description: 'Score, locate every issue, write the fixes.', status: 'pending', meta: '—' },
    ],
    factsReady: { count: 23 },
    answersSoFar: [
      { id: 6, intent: 'category', question: 'best invoicing app for freelance designers', engine: 'gemini', verdict: 'absent' },
      { id: 5, intent: 'definition', question: 'what is Tallybook', engine: 'gemini', verdict: 'mentioned' },
      { id: 4, intent: 'feature', question: 'does Tallybook support recurring invoices', engine: 'gemini', verdict: 'wrong_fact' },
      { id: 3, intent: 'comparison', question: 'Tallybook vs Ledgerly', engine: 'gemini', verdict: 'mentioned' },
      { id: 2, intent: 'task', question: 'how to send a late payment reminder automatically', engine: 'gemini', verdict: 'absent' },
      { id: 1, intent: 'reputation', question: 'Tallybook reviews', engine: 'gemini', verdict: 'mentioned' },
    ],
    answersProgress: { done: 12, total: 20, engineLabel: 'Gemini' },
    early: { routesCrawled: 38, siteHealth: 16, botsBlocked: 2 },
    shareToken: SAMPLE_ID,
    engines: ['gemini', 'chatgpt', 'perplexity'],
    error: null,
  };
}

let n = 0;
const fact = (
  key: string,
  group: 'basics' | 'pricing' | 'features',
  label: string,
  value: string | null,
  sourceRoute: string | null,
  sourceQuote: string | null,
  note: string | null = null,
) => ({
  id: ++n,
  key,
  group,
  label,
  value,
  status: note ? (value ? ('ambiguous' as const) : ('missing' as const)) : ('ok' as const),
  note,
  confirmed: !note,
  sourceRoute,
  sourceQuote,
  editedByUser: false,
});

/** Read-only demo of the fact sheet (spec: FactSheet artboard). */
export const SAMPLE_FACT_SHEET: IFactSheet = {
  scanId: SAMPLE_ID,
  domain: 'tallybook.app',
  brandName: 'Tallybook',
  status: 'running',
  version: 1,
  factCount: 23,
  pageCount: 9,
  groups: [
    {
      group: 'basics',
      title: 'Basics',
      hint: 'From home and about',
      facts: [
        fact('product_name', 'basics', 'App name', 'Tallybook', '/', '“Tallybook — invoicing for people who would rather be working.”'),
        fact('one_line_description', 'basics', 'One-line description', 'Invoicing and payment reminders for freelancers and small studios', '/', '“Send invoices, get paid, and stop chasing clients.”'),
        fact('category', 'basics', 'Category', 'Invoicing software', '/', 'Inferred from page title and headings'),
        fact('platforms', 'basics', 'Platforms', 'Web, iOS', '/download', '“Available on the web and the App Store.”'),
        fact('target_customer', 'basics', 'Target customer', 'Freelancers and studios under 10 people', '/about', '“Built for freelancers and small studios.”'),
        fact('company_name', 'basics', 'Company', 'Tallybook Ltd', '/about', '“Tallybook Ltd is a small team in Lisbon.”'),
        fact('founded_year', 'basics', 'Founded', '2024', '/about', '“We launched Tallybook in 2024.”'),
        fact('headquarters', 'basics', 'Headquarters', 'Lisbon, Portugal', '/about', '“Tallybook Ltd is a small team in Lisbon.”'),
      ],
    },
    {
      group: 'pricing',
      title: 'Pricing',
      hint: 'From /pricing',
      facts: [
        fact('free_tier', 'pricing', 'Free tier', 'Free · 3 clients', '/pricing', '“Free forever for up to 3 clients.”'),
        fact('paid_tier_price', 'pricing', 'Paid tier', '$12 per month', '/pricing', '“Pro — $12/mo, billed annually.”', 'Two prices on the page ($12 annual, $15 monthly). Engines may quote either.'),
        fact('paid_tier_name', 'pricing', 'Paid tier name', null, '/pricing', 'Not stated clearly on the page', 'No tier name found. Fixes will show [confirm: paid tier name].'),
        fact('billing_options', 'pricing', 'Billing options', '$12 annual, $15 monthly', '/pricing', '“$15/mo billed monthly.”'),
        fact('free_trial', 'pricing', 'Free trial', null, null, null, 'No trial mentioned. The free tier may stand in for one.'),
        fact('enterprise_plan', 'pricing', 'Enterprise plan', 'No', '/pricing', '“Two plans. No sales call.”'),
        fact('currency', 'pricing', 'Currency', 'USD', '/pricing', '“All prices in USD.”'),
      ],
    },
    {
      group: 'features',
      title: 'Key features',
      hint: 'From feature pages',
      facts: [
        fact('feature_1', 'features', 'Recurring invoices', 'Yes, weekly, monthly or custom', '/features/recurring', '“Set an invoice to repeat on any schedule.”'),
        fact('feature_2', 'features', 'Automatic reminders', 'Yes, up to 3 per invoice', '/features/reminders', '“Tallybook nudges late clients for you.”'),
        fact('feature_3', 'features', 'Payments', 'Stripe and PayPal', '/integrations', '“Connect Stripe or PayPal in two clicks.”'),
        fact('feature_4', 'features', 'Multi-currency', 'Yes, 40 currencies', '/features/currency', '“Bill in 40 currencies.”'),
        fact('feature_5', 'features', 'Expense tracking', 'Yes, receipts attach to invoices', '/features/expenses', '“Snap a receipt and bill it back.”'),
        fact('feature_6', 'features', 'Client portal', 'Yes, clients see and pay every invoice', '/features/portal', '“One link where clients see every invoice.”'),
        fact('integrations', 'features', 'Integrations', 'Stripe, PayPal, Zapier', '/integrations', '“Stripe, PayPal and Zapier.”'),
        fact('security_compliance', 'features', 'Security & compliance', 'GDPR', '/security', '“Data stored in the EU, GDPR compliant.”'),
      ],
    },
  ],
  competitors: [
    { id: 1, name: 'Ledgerly', origin: 'site', sourceRoute: '/compare' },
    { id: 2, name: 'InvoiceKit', origin: 'site', sourceRoute: '/blog' },
    { id: 3, name: 'Paystub Pro', origin: 'engine', sourceRoute: null },
  ],
  ratings: [
    { platform: 'g2', label: 'G2', value: 4.6, count: 128, sourceUrl: 'https://www.g2.com/products/tallybook', origin: 'site' },
    { platform: 'capterra', label: 'Capterra', value: null, count: null, sourceUrl: null, origin: null },
    { platform: 'app_store', label: 'App Store', value: 4.4, count: 2100, sourceUrl: 'https://apps.apple.com/app/tallybook', origin: 'site' },
    { platform: 'google_play', label: 'Google Play', value: null, count: null, sourceUrl: null, origin: null },
    { platform: 'trustpilot', label: 'Trustpilot', value: null, count: null, sourceUrl: null, origin: null },
  ],
  readOnly: true,
};
