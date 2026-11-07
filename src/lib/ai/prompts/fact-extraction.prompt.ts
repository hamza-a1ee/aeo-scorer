import { FACT_CATALOG } from '@/constants/fact-catalog.constant';

export const FACT_EXTRACTION_SYSTEM =
  'You extract a factual fact sheet about a software product from its own website. You never guess. Every fact must be backed by a sentence copied verbatim from one of the provided pages.';

export function buildFactExtractionPrompt(domain: string, pages: { route: string; title: string | null; text: string }[]) {
  const catalog = FACT_CATALOG.map(f => `- ${f.key} (${f.group}): ${f.label}. ${f.hint}`).join('\n');
  const body = pages
    .map(p => `### ROUTE: ${p.route}${p.title ? `\nTITLE: ${p.title}` : ''}\n${p.text}`)
    .join('\n\n');
  return `Website: ${domain}

Fill this fact catalog using ONLY the pages below. Return one entry per key, all ${FACT_CATALOG.length} keys, in catalog order.

CATALOG
${catalog}

RULES
- value: short and plain (e.g. "Free · 3 clients", "$12 per month, billed annually", "Web, iOS"). Empty string if the pages do not state it.
- status: "ok" when one clear statement exists; "ambiguous" when pages conflict or the fact is only implied (explain in note, e.g. "Two prices on the page ($12 annual, $15 monthly). Engines may quote either."); "missing" when not stated (note says what is missing).
- source_quote: copy one sentence or phrase EXACTLY as it appears in the page text (same words, same punctuation). Never paraphrase. Empty when missing.
- source_route: the ROUTE the quote is from.
- feature_1..feature_6: the six most prominent product features. label = the feature's name (e.g. "Recurring invoices"); value = what it does in a few words (e.g. "Yes, weekly, monthly or custom"). Leave extra slots empty with status "missing" if fewer exist.
- competitors: products the site names as alternatives or compares itself with.
- ratings: review-site ratings the site displays (G2, Capterra, App Store, Google Play, Trustpilot) with the route.

PAGES
${body}`;
}
