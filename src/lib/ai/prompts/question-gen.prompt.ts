import { INTENT_DISTRIBUTION } from '@/constants/intents.constant';

export const QUESTION_GEN_SYSTEM =
  'You write the questions real buyers type into AI assistants like ChatGPT, Gemini and Perplexity when choosing software. Natural, specific, lower-case is fine. No marketing language.';

export function buildQuestionPrompt(input: {
  brand: string;
  category: string | null;
  description: string | null;
  target: string | null;
  features: string[];
  competitors: string[];
}) {
  const dist = Object.entries(INTENT_DISTRIBUTION)
    .map(([intent, n]) => `- ${intent}: ${n}`)
    .join('\n');
  return `Product: ${input.brand}
Category: ${input.category ?? 'unknown'}
Description: ${input.description ?? 'unknown'}
Target customer: ${input.target ?? 'unknown'}
Key features: ${input.features.join('; ') || 'unknown'}
Known competitors: ${input.competitors.join(', ') || 'none known'}

Write ${Object.values(INTENT_DISTRIBUTION).reduce((a, b) => a + b, 0)} buyer questions with exactly this many per intent:
${dist}

Intent meanings:
- category: looking for the best tool in the category for their situation. MUST NOT name ${input.brand}. e.g. "best invoicing app for freelance designers"
- definition: what the product is. Names ${input.brand}. e.g. "what is ${input.brand}"
- feature: whether the product does something specific. Names ${input.brand}. e.g. "does ${input.brand} support recurring invoices"
- comparison: ${input.brand} vs a named competitor, or alternatives to a competitor. e.g. "${input.brand} vs ${input.competitors[0] ?? 'a competitor'}"
- task: how to get a job done that the product solves. MUST NOT name ${input.brand}. e.g. "how to send a late payment reminder automatically"
- reputation: reviews, pricing value, complaints. Names ${input.brand}. e.g. "${input.brand} reviews"

Keep each question under 15 words. No duplicates.`;
}
