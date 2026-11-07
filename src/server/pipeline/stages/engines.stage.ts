import 'server-only';

import pLimit from 'p-limit';

import { listAnswers, listQuestions, upsertAnswer } from '@/server/repositories/answer.repo';

import type { IPipelineStage } from '../pipeline-context.type';

/** Stage 5: every question to every configured engine, one engine at a time. */
export const enginesStage: IPipelineStage = {
  key: 'engines',
  async run(ctx) {
    const { scan, env, engines } = ctx;
    if (!engines.length) throw new Error('No answer engine is configured. Set GEMINI_API_KEY in .env.');

    const questions = await listQuestions(scan.id);
    const answered = new Set(
      (await listAnswers(scan.id)).filter(a => a.status === 'ok').map(a => `${a.question_id}:${a.engine}`),
    );
    const total = questions.length * engines.length;
    let done = answered.size;
    let stopped = false;

    for (const engine of engines) {
      if (stopped) break;
      const limit = pLimit(env.ENGINE_CONCURRENCY);
      await ctx.progress({ done, total, current_engine: engine.id });

      await Promise.all(
        questions.map(q =>
          limit(async () => {
            if (stopped || answered.has(`${q.id}:${engine.id}`)) return;
            if (await ctx.shouldStop()) {
              stopped = true;
              return;
            }
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 90_000);
            try {
              const answer = await engine.ask(q.text, controller.signal);
              await upsertAnswer({
                scan_id: scan.id,
                question_id: q.id,
                engine: engine.id,
                status: answer.text.trim() ? 'ok' : 'failed',
                raw_text: answer.text,
                citations: answer.citations,
                model: answer.model,
                latency_ms: answer.latencyMs,
                error: answer.text.trim() ? null : 'Empty answer',
              });
            } catch (error) {
              await upsertAnswer({
                scan_id: scan.id,
                question_id: q.id,
                engine: engine.id,
                status: 'failed',
                raw_text: null,
                citations: [],
                model: null,
                latency_ms: null,
                error: (error instanceof Error ? error.message : String(error)).slice(0, 500),
              });
            } finally {
              clearTimeout(timer);
            }
            done++;
            await ctx.progress({ done, total, current_engine: engine.id });
          }),
        ),
      );
    }

    const ok = (await listAnswers(scan.id)).filter(a => a.status === 'ok').length;
    if (!ok && !stopped) throw new Error('Every engine call failed. Check your API keys and quotas.');
  },
};
