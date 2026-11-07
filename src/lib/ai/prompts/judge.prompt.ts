export const JUDGE_SYSTEM =
  'You audit what an AI answer engine said about a software brand. You compare every claim about the brand against the brand\'s confirmed fact sheet. You are strict and literal: a claim is "wrong" only when a confirmed fact contradicts it, "correct" only when a confirmed fact supports it, otherwise "unverifiable".';

export function buildJudgePrompt(input: {
  brand: string;
  aliases: string[];
  intent: string;
  question: string;
  answer: string;
  citations: string[];
  routes: string[];
  facts: { key: string; label: string; value: string }[];
  competitors: string[];
}) {
  return `BRAND: ${input.brand} (also written as: ${input.aliases.join(', ')})
QUESTION (${input.intent}): ${input.question}

ANSWER FROM THE ENGINE:
"""
${input.answer.slice(0, 8000)}
"""

CITATIONS THE ENGINE GAVE:
${input.citations.slice(0, 20).join('\n') || '(none)'}

OUR ROUTES (pages on the brand's site):
${input.routes.slice(0, 60).join('\n')}

CONFIRMED FACT SHEET (key: label = value):
${input.facts.map(f => `${f.key}: ${f.label} = ${f.value}`).join('\n') || '(empty)'}

KNOWN COMPETITORS: ${input.competitors.join(', ') || '(none)'}

Instructions:
- claims: only claims about ${input.brand} itself (pricing, features, platforms, other). Pricing and feature claims matter most.
- should_cite_route: the route from OUR ROUTES that should have answered this question; "none" if no page covers it.
- why: if absent or wrong, name the cause on the site (e.g. "Home page never says 'freelance designers'. Ledgerly's page does." or "Engine cited an old blog post because home has no definition."). If fine, say what worked.
- ratings_quoted: only ratings the answer states for ${input.brand}.`;
}
