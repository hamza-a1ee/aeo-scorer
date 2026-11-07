import 'server-only';

import type { TPageType } from '@/types/enums/scan.enum';

/** Collects every @type in JSON-LD (including @graph) plus microdata types. */
export function schemaTypes(jsonld: unknown[], microdata: string[] = []): string[] {
  const types = new Set<string>(microdata);
  const stack = [...jsonld];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    const obj = node as Record<string, unknown>;
    const t = obj['@type'];
    if (typeof t === 'string') types.add(t);
    if (Array.isArray(t)) t.forEach(x => typeof x === 'string' && types.add(x));
    for (const v of Object.values(obj)) if (v && typeof v === 'object') stack.push(v);
  }
  return [...types];
}

const EXPECTED: Partial<Record<TPageType, string[][]>> = {
  home: [['Organization'], ['WebSite'], ['SoftwareApplication'], ['Product']],
  pricing: [['Offer', 'Product'], ['Offer', 'SoftwareApplication'], ['AggregateOffer']],
  faq: [['FAQPage']],
  blog: [['Article'], ['BlogPosting'], ['NewsArticle']],
};

/** null when no expectation exists for the page type. */
export function hasExpectedSchema(type: TPageType, types: string[]): boolean | null {
  const options = EXPECTED[type];
  if (!options) return null;
  return options.some(set => set.every(t => types.includes(t)));
}

export function expectedSchemaLabel(type: TPageType): string | null {
  const options = EXPECTED[type];
  return options ? options.map(o => o.join(' + ')).join(' or ') : null;
}
