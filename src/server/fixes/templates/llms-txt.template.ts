import { type IDraftFact, valueOrToken } from '../confirm-token.util';

interface ILlmsInput {
  brand: string;
  origin: string;
  facts: IDraftFact[];
  pages: { route: string; title: string | null; pageType: string }[];
}

const KEY_TYPES = ['home', 'pricing', 'features', 'product', 'compare', 'integrations', 'docs', 'faq', 'security', 'about'];

/** llms.txt per llmstxt.org: H1, blockquote summary, then link sections. */
export function buildLlmsTxt({ brand, origin, facts, pages }: ILlmsInput): string {
  const base = origin.replace(/\/$/, '');
  const v = (key: string) => valueOrToken(facts, key);
  const features = facts
    .filter(f => f.key.startsWith('feature_') && f.confirmed && f.value)
    .map(f => `- ${f.label}: ${f.value}`);

  const keyPages = KEY_TYPES.flatMap(t => pages.filter(p => p.pageType === t))
    .filter((p, i, all) => all.findIndex(x => x.route === p.route) === i)
    .slice(0, 12)
    .map(p => `- [${p.title?.trim() || p.route}](${base}${p.route})`);

  return [
    `# ${brand}`,
    '',
    `> ${v('one_line_description')}`,
    '',
    `${brand} is ${v('category').toLowerCase()} for ${v('target_customer')}. It runs on ${v('platforms')}.`,
    `Pricing: ${v('free_tier')}. Paid plan: ${v('paid_tier_price')}.`,
    '',
    ...(features.length ? ['## Features', '', ...features, ''] : []),
    '## Key pages',
    '',
    ...keyPages,
    '',
  ].join('\n');
}
