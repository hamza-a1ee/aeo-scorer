import { getConfiguredEngines } from '@/lib/ai/engine-registry';
import { getEnv } from '@/lib/env';
import { isSupabaseConfigured } from '@/lib/supabase/server-client';
import { handleRoute, ok } from '@/server/api-response.util';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () =>
  ok({
    ok: true,
    engines: getConfiguredEngines().map(e => e.id),
    gemini: !!getEnv().GEMINI_API_KEY,
    db: isSupabaseConfigured(),
  }),
);
