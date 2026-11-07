import 'server-only';

import { z } from 'zod';

const optionalKey = z
  .string()
  .optional()
  .transform(v => (v && v.trim() ? v.trim() : undefined));

const int = (fallback: number) =>
  z.coerce.number().int().positive().catch(fallback);

const serverEnvSchema = z.object({
  GEMINI_API_KEY: optionalKey,
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  GEMINI_MODEL_FAST: z.string().default('gemini-3.5-flash-lite'),
  OPENAI_API_KEY: optionalKey,
  OPENAI_MODEL: z.string().default('gpt-5-mini'),
  PERPLEXITY_API_KEY: optionalKey,
  PERPLEXITY_MODEL: z.string().default('sonar'),
  NEXT_PUBLIC_SUPABASE_URL: optionalKey,
  SUPABASE_SERVICE_ROLE_KEY: optionalKey,
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  CRAWLER_USER_AGENT: optionalKey,
  MAX_PAGES: int(50),
  MAX_QUESTIONS: int(20),
  SCAN_RATE_LIMIT_PER_DOMAIN_PER_DAY: int(1),
  CRAWL_CONCURRENCY: int(4),
  ENGINE_CONCURRENCY: int(2),
  JUDGE_CONCURRENCY: int(4),
  MAX_CONCURRENT_SCANS: int(2),
});

export type TServerEnv = z.infer<typeof serverEnvSchema>;

let cached: TServerEnv | null = null;

/** Parsed server env. Missing keys are allowed here and checked where used. */
export function getEnv(): TServerEnv {
  if (!cached) cached = serverEnvSchema.parse(process.env);
  return cached;
}

export function getCrawlerUserAgent(): string {
  const env = getEnv();
  return (
    env.CRAWLER_USER_AGENT ??
    `AEOAppBot/1.0 (+${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/our-crawler)`
  );
}

/** Throws a readable error when a required key is missing. */
export function requireEnv<K extends keyof TServerEnv>(
  key: K,
): NonNullable<TServerEnv[K]> {
  const value = getEnv()[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`${String(key)} is not set. Add it to .env (see .env.example).`);
  }
  return value as NonNullable<TServerEnv[K]>;
}
