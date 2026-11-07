import { z } from 'zod';

import { cappedArray } from './llm-schema.util';
import { INTENTS } from '@/types/enums/answer.enum';

export const questionGenSchema = z.object({
  questions: cappedArray(
    z.object({
      intent: z.enum(INTENTS),
      text: z.string().describe('The question exactly as a buyer would type it into an AI assistant'),
    }),
    30,
  ).refine(q => q.length >= 10, 'Return at least 10 questions'),
});

export type TQuestionGen = z.infer<typeof questionGenSchema>;
