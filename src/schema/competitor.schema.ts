import { z } from 'zod';

export const competitorSchema = z.object({
  name: z.string().trim().min(1, 'Enter a competitor name').max(80, 'Keep it under 80 characters'),
});
