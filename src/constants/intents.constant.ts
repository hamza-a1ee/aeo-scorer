import type { TIntent } from '@/types/enums/answer.enum';

/** How many of the 20 buyer questions each intent gets. Sums to 20. */
export const INTENT_DISTRIBUTION: Record<TIntent, number> = {
  category: 4,
  definition: 3,
  feature: 4,
  comparison: 3,
  task: 3,
  reputation: 3,
};

/** Category and task questions count double in visibility. */
export const INTENT_WEIGHT: Record<TIntent, number> = {
  category: 2,
  definition: 1,
  feature: 1,
  comparison: 1,
  task: 2,
  reputation: 1,
};

/** Questions of these intents must not name the brand. */
export const UNBRANDED_INTENTS: TIntent[] = ['category', 'task'];
