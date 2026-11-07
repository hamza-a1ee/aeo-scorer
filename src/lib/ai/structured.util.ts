import 'server-only';

import { z } from 'zod';

import { getEnv } from '@/lib/env';

import { getGenAI, isRetryable, withRetry } from './gemini.client';

/**
 * Keys dropped before the schema reaches Gemini. Length and range limits make the
 * served constraint too large ("too many states for serving"); zod still checks
 * the reply after parsing.
 */
const DROPPED_KEYS = new Set([
  '$schema',
  '$id',
  'additionalProperties',
  'minItems',
  'maxItems',
  'minLength',
  'maxLength',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'pattern',
  'format',
]);

/** Strips keys outside what Gemini can serve. */
function sanitize(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitize);
  if (!node || typeof node !== 'object') return node;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    if (DROPPED_KEYS.has(k)) continue;
    out[k] = sanitize(v);
  }
  return out;
}

export function toGeminiJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // io: 'input' describes what the model must send, before zod transforms run.
  return sanitize(z.toJSONSchema(schema, { io: 'input' })) as Record<string, unknown>;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.search(/[[{]/);
    const end = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error('Model did not return JSON');
  }
}

interface IStructuredOptions {
  system?: string;
  model?: string;
  temperature?: number;
  /** Use the fast model (cheaper) for this call. */
  fast?: boolean;
}

/**
 * Gemini structured output via the Interactions API.
 * Never passes tools: grounding and JSON are kept in separate calls.
 * Validates with zod and retries once with the validation error appended.
 */
export async function callStructured<T>(
  schema: z.ZodType<T>,
  prompt: string,
  opts: IStructuredOptions = {},
): Promise<T> {
  const env = getEnv();
  const primary = opts.model ?? (opts.fast ? env.GEMINI_MODEL_FAST : env.GEMINI_MODEL);
  const jsonSchema = toGeminiJsonSchema(schema);

  const run = async (input: string, model: string) => {
    const interaction = await getGenAI().interactions.create({
      model,
      input,
      store: false,
      system_instruction: opts.system,
      generation_config: { temperature: opts.temperature ?? 0.2 },
      response_format: { type: 'text', mime_type: 'application/json', schema: jsonSchema },
    });
    return interaction.output_text ?? '';
  };

  const attempt = async (input: string) => {
    try {
      return await withRetry(() => run(input, primary));
    } catch (error) {
      if (isRetryable(error) && primary !== env.GEMINI_MODEL_FAST) {
        return withRetry(() => run(input, env.GEMINI_MODEL_FAST), 1);
      }
      throw error;
    }
  };

  const first = await attempt(prompt);
  const parsed = schema.safeParse(safeJson(first));
  if (parsed.success) return parsed.data;

  const repair = `${prompt}\n\nYour previous reply did not match the required JSON schema. Problems:\n${parsed.error.issues
    .slice(0, 8)
    .map(i => `- ${i.path.join('.')}: ${i.message}`)
    .join('\n')}\nReturn only valid JSON that matches the schema.`;
  const second = await attempt(repair);
  return schema.parse(extractJson(second));
}

function safeJson(text: string): unknown {
  try {
    return extractJson(text);
  } catch {
    return undefined;
  }
}
