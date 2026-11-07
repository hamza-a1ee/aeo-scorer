import type { TPageType } from '@/types/enums/scan.enum';

const RULES: [RegExp, TPageType][] = [
  [/^\/(pricing|plans|price|prices|buy|upgrade)(\/|$)/i, 'pricing'],
  [/(^|\/)(compare|vs|versus|alternatives?)(\/|-|$)|-vs-|-alternatives?(\/|$)/i, 'compare'],
  [/^\/(features?|capabilities|tour)(\/|$)/i, 'features'],
  [/^\/(product|products|platform|solutions?|use-cases?)(\/|$)/i, 'product'],
  [/^\/(about|company|team|our-story|story)(\/|$)/i, 'about'],
  [/^\/(faq|faqs|help\/faq|questions)(\/|$)/i, 'faq'],
  [/^\/(docs?|documentation|help|support|guides?|kb|knowledge-base)(\/|$)/i, 'docs'],
  [/^\/(integrations?|apps|marketplace|connectors)(\/|$)/i, 'integrations'],
  [/^\/(security|trust|compliance|privacy-and-security)(\/|$)/i, 'security'],
  [/^\/(blog|news|articles?|posts?|changelog|updates)(\/|$)/i, 'blog'],
];

export function classifyRoute(route: string): TPageType {
  if (route === '/' || route === '') return 'home';
  for (const [re, type] of RULES) if (re.test(route)) return type;
  return 'other';
}

/** Lower is crawled first. */
export const PAGE_PRIORITY: Record<TPageType, number> = {
  home: 0,
  pricing: 1,
  features: 2,
  product: 2,
  compare: 3,
  about: 4,
  faq: 5,
  integrations: 5,
  security: 5,
  docs: 6,
  other: 7,
  blog: 8,
};
