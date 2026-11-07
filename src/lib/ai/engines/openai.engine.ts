import 'server-only';

import { z } from 'zod';

import { ENGINE_LABELS } from '@/constants/engines.constant';
import { getEnv } from '@/lib/env';

import {
  dedupeCitations,
  ENGINE_SYSTEM_PROMPT,
  type IAnswerEngine,
} from '../answer-engine.interface';
import { withRetry } from '../gemini.client';

const responseSchema = z.looseObject({
  output_text: z.string().optional(),
  output: z
    .array(
      z.looseObject({
        type: z.string().optional(),
        content: z
          .array(
            z.looseObject({
              type: z.string().optional(),
              text: z.string().optional(),
              annotations: z
                .array(z.looseObject({ type: z.string().optional(), url: z.string().optional(), title: z.string().optional() }))
                .optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

/** ChatGPT via the OpenAI Responses API with the web_search tool. */
export const openaiEngine: IAnswerEngine = {
  id: 'chatgpt',
  label: ENGINE_LABELS.chatgpt,
  isConfigured: () => !!getEnv().OPENAI_API_KEY,
  async ask(question, signal) {
    const env = getEnv();
    const started = Date.now();
    const json = await withRetry(async () => {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          instructions: ENGINE_SYSTEM_PROMPT,
          input: question,
          tools: [{ type: 'web_search' }],
          store: false,
        }),
      });
      if (!res.ok) {
        const err = new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return responseSchema.parse(await res.json());
    });

    const texts: string[] = [];
    const citations: { url: string; title: string | null }[] = [];
    for (const item of json.output ?? []) {
      if (item.type !== 'message') continue;
      for (const block of item.content ?? []) {
        if (block.text) texts.push(block.text);
        for (const a of block.annotations ?? []) {
          if (a.type === 'url_citation' && a.url) citations.push({ url: a.url, title: a.title ?? null });
        }
      }
    }
    return {
      text: json.output_text ?? texts.join('\n'),
      citations: dedupeCitations(citations),
      model: env.OPENAI_MODEL,
      latencyMs: Date.now() - started,
    };
  },
};
