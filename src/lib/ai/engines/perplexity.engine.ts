// Disabled: the app runs on Gemini only for now. Uncomment this file and its
// lines in engine-registry.ts, env.ts and .env.example to turn it back on.
export {};

// import 'server-only';
//
// import { z } from 'zod';
//
// import { ENGINE_LABELS } from '@/constants/engines.constant';
// import { getEnv } from '@/lib/env';
//
// import {
//   dedupeCitations,
//   ENGINE_SYSTEM_PROMPT,
//   type IAnswerEngine,
// } from '../answer-engine.interface';
// import { withRetry } from '../gemini.client';
//
// const responseSchema = z.looseObject({
//   choices: z.array(z.looseObject({ message: z.looseObject({ content: z.string().nullable().optional() }) })),
//   citations: z.array(z.string()).optional(),
//   search_results: z
//     .array(z.looseObject({ url: z.string().optional(), title: z.string().optional() }))
//     .optional(),
// });
//
// /** Perplexity Sonar chat completions; citations come back as URLs. */
// export const perplexityEngine: IAnswerEngine = {
//   id: 'perplexity',
//   label: ENGINE_LABELS.perplexity,
//   isConfigured: () => !!getEnv().PERPLEXITY_API_KEY,
//   async ask(question, signal) {
//     const env = getEnv();
//     const started = Date.now();
//     const json = await withRetry(async () => {
//       const res = await fetch('https://api.perplexity.ai/chat/completions', {
//         method: 'POST',
//         signal,
//         headers: {
//           Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: env.PERPLEXITY_MODEL,
//           messages: [
//             { role: 'system', content: ENGINE_SYSTEM_PROMPT },
//             { role: 'user', content: question },
//           ],
//         }),
//       });
//       if (!res.ok) {
//         const err = new Error(`Perplexity ${res.status}: ${(await res.text()).slice(0, 300)}`) as Error & { status?: number };
//         err.status = res.status;
//         throw err;
//       }
//       return responseSchema.parse(await res.json());
//     });
//
//     const titles = new Map((json.search_results ?? []).filter(r => r.url).map(r => [r.url!, r.title ?? null]));
//     const urls = json.citations ?? (json.search_results ?? []).map(r => r.url).filter((u): u is string => !!u);
//     return {
//       text: json.choices[0]?.message.content ?? '',
//       citations: dedupeCitations(urls.map(url => ({ url, title: titles.get(url) ?? null }))),
//       model: env.PERPLEXITY_MODEL,
//       latencyMs: Date.now() - started,
//     };
//   },
// };
