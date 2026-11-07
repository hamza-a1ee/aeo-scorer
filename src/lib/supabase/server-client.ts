import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getEnv } from '@/lib/env';
import { HttpError } from '@/server/http-error';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const env = getEnv();
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Service-role client. Server only; bypasses RLS (tables have no policies). */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(
      503,
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.',
    );
  }
  client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Unwraps a supabase-js result, throwing on error. */
export function unwrap<T>(result: { data: unknown; error: { message: string; code?: string } | null }): T {
  if (result.error) {
    const err = new Error(result.error.message) as Error & { code?: string };
    err.code = result.error.code;
    throw err;
  }
  return result.data as T;
}
