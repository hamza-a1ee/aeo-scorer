import { z } from 'zod';

import { RATING_PLATFORMS } from '@/types/enums/fact.enum';

export const ratingPatchSchema = z.object({
  platform: z.enum(RATING_PLATFORMS),
  value: z.number().min(0).max(5, 'Ratings are out of 5').nullable(),
  count: z.number().int().min(0).nullable().optional(),
});
