import type { IDraftFact } from '@/server/fixes/confirm-token.util';
import { confirmToken } from '@/server/fixes/confirm-token.util';

export const FIX_DRAFT_SYSTEM =
  'You write short website copy that AI answer engines can quote word for word. Plain, literal, answer-first sentences. No marketing adjectives (powerful, seamless, robust, innovative, best-in-class, effortless). No claims that are not in the fact sheet. Never invent prices, numbers, platforms or features.';

const TYPE_RULES: Record<string, string> = {
  definitional_paragraph:
    'Write a "What is {brand}?" paragraph for the top of the home page. 60 to 90 words. First sentence: "{brand} is <category> for <target customer>." Then what it does (2–3 key features), platforms, and pricing in one sentence. Heading: "What is {brand}?".',
  feature_summary:
    'Write a feature summary for the top of the page. 80 to 140 words. Heading: the feature name in plain words (no slogans). First sentence answers "Does {brand} do X?" directly. If an engine said something wrong, state the correct fact plainly. Then 2–4 short sentences on how it works, and which plan includes it if known.',
  rating_fix:
    'Write a short "Ratings and reviews" block. 30 to 70 words. State each platform rating as "<value> out of 5 on <platform> from <count> reviews". Only use ratings listed below. Heading: "Ratings and reviews".',
};

export function buildFixDraftPrompt(input: {
  type: string;
  brand: string;
  route: string;
  placement: string | null;
  gap: string;
  focus: string | null;
  facts: IDraftFact[];
  ratings: { platform: string; value: number; count: number | null }[];
  variant: number;
}) {
  const confirmed = input.facts.filter(f => f.confirmed && f.value);
  const unconfirmed = input.facts.filter(f => !f.confirmed);
  const rules = (TYPE_RULES[input.type] ?? '').replaceAll('{brand}', input.brand);
  return `BRAND: ${input.brand}
PAGE: ${input.route}${input.placement ? ` (${input.placement.toLowerCase()})` : ''}
GAP THIS COPY CLOSES: ${input.gap}
${input.focus ? `FOCUS: ${input.focus}\n` : ''}
TASK: ${rules}

CONFIRMED FACTS (use these values exactly):
${confirmed.map(f => `- ${f.label}: ${f.value}`).join('\n') || '(none)'}

UNCONFIRMED FACTS (never write a value for these; if the copy needs one, write the token exactly as shown):
${unconfirmed.map(f => `- ${f.label} → ${confirmToken(f.label)}`).join('\n') || '(none)'}
${input.ratings.length ? `\nRATINGS (real, from the site owner):\n${input.ratings.map(r => `- ${r.platform}: ${r.value}${r.count ? ` from ${r.count} reviews` : ''}`).join('\n')}\n` : ''}
${input.variant > 0 ? `This is rewrite #${input.variant}. Use different sentence structure from earlier drafts, same facts.\n` : ''}Return JSON with "heading" and "body".`;
}
