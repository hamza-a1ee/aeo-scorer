import 'server-only';

import { ENGINE_LABELS } from '@/constants/engines.constant';
import { getEnv } from '@/lib/env';
import type { TCitation } from '@/lib/supabase/rows.type';

import {
  dedupeCitations,
  ENGINE_SYSTEM_PROMPT,
  type IAnswerEngine,
} from '../answer-engine.interface';
import { getGenAI, withRetry } from '../gemini.client';

interface IStepLike {
  type?: string;
  content?: { type?: string; text?: string; annotations?: { type?: string; url?: string; title?: string }[] }[];
}

/** Gemini with Google Search grounding. Free text plus url_citation annotations. */
export const geminiEngine: IAnswerEngine = {
  id: 'gemini',
  label: ENGINE_LABELS.gemini,
  isConfigured: () => !!getEnv().GEMINI_API_KEY,
  async ask(question) {
    const model = getEnv().GEMINI_MODEL;
    const started = Date.now();
    const interaction = await withRetry(() =>
      getGenAI().interactions.create({
        model,
        input: question,
        store: false,
        system_instruction: ENGINE_SYSTEM_PROMPT,
        tools: [{ type: 'google_search' }],
      }),
    );
    const citations: TCitation[] = [];
    for (const step of (interaction.steps ?? []) as IStepLike[]) {
      if (step.type !== 'model_output') continue;
      for (const block of step.content ?? []) {
        for (const a of block.annotations ?? []) {
          if (a.type === 'url_citation' && a.url) citations.push({ url: a.url, title: a.title ?? null });
        }
      }
    }
    return {
      text: interaction.output_text ?? '',
      citations: dedupeCitations(citations),
      model,
      latencyMs: Date.now() - started,
    };
  },
};
