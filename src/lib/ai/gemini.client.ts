import 'server-only';

import { GoogleGenAI } from '@google/genai';

import { requireEnv } from '@/lib/env';

let client: GoogleGenAI | null = null;

/** Google Gen AI SDK client (Gemini Developer API, Interactions API). */
export function getGenAI(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: requireEnv('GEMINI_API_KEY') });
  return client;
}

export function isRetryable(error: unknown): boolean {
  const e = error as { status?: number; code?: number; message?: string };
  const status = e?.status ?? e?.code;
  if (status === 429 || (typeof status === 'number' && status >= 500)) return true;
  return /429|rate|quota|unavailable|overloaded|timeout|ECONNRESET|fetch failed/i.test(e?.message ?? '');
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseMs = 1500): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (attempt === retries || !isRetryable(error)) break;
      await new Promise(r => setTimeout(r, baseMs * 2 ** attempt + Math.random() * 400));
    }
  }
  throw last;
}
