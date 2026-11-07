import type { TCitation } from '@/lib/supabase/rows.type';
import type { TEngine } from '@/types/enums/answer.enum';

export interface IEngineAnswer {
  text: string;
  citations: TCitation[];
  model: string;
  latencyMs: number;
}

/** One AI answer engine. Unconfigured engines are skipped and hidden. */
export interface IAnswerEngine {
  id: TEngine;
  label: string;
  isConfigured(): boolean;
  ask(question: string, signal?: AbortSignal): Promise<IEngineAnswer>;
}

export const ENGINE_SYSTEM_PROMPT =
  'You are answering a real user. Answer the question helpfully and specifically, naming the products or companies you would recommend where relevant. Search the web for current information and cite your sources.';

export function dedupeCitations(items: TCitation[]): TCitation[] {
  const seen = new Set<string>();
  const out: TCitation[] = [];
  for (const c of items) {
    if (!c.url || seen.has(c.url)) continue;
    seen.add(c.url);
    out.push(c);
  }
  return out;
}
