import { z } from 'zod';

export const fixDoneSchema = z.object({ done: z.boolean() });
