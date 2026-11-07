import { z } from 'zod';

/**
 * Array for LLM output schemas. Gemini rejects schemas with array length limits
 * ("too many states for serving"), so the cap is not sent to the model; extra
 * items are dropped after parsing instead of failing validation.
 */
export const cappedArray = <T extends z.ZodType>(item: T, max: number) =>
  z.array(item).transform(items => items.slice(0, max));
