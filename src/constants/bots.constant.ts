/** AI crawlers whose access we check in robots.txt, in report order. */
export const AI_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Bingbot',
  'CCBot',
] as const;
export type TAiBot = (typeof AI_BOTS)[number];
