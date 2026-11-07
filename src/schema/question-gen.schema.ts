import { z } from 'zod';

import { INTENTS } from '@/types/enums/answer.enum';

export const questionGenSchema = z.object({
  questions: z
    .array(
      z.object({
        intent: z.enum(INTENTS),
        text: z.string().describe('The question exactly as a buyer would type it into an AI assistant'),
      }),
    )
    .min(10)
    .max(30),
});

export type TQuestionGen = z.infer<typeof questionGenSchema>;
