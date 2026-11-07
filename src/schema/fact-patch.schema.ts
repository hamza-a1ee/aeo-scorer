import { z } from 'zod';

export const factPatchSchema = z.object({
  value: z
    .string()
    .trim()
    .max(500, 'Keep it under 500 characters')
    .nullable()
    .transform(v => (v ? v : null)),
});
