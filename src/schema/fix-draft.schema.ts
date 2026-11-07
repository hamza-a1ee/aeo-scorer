import { z } from 'zod';

/** LLM output for a drafted fix. Notes are computed server-side, not by the model. */
export const fixDraftSchema = z.object({
  heading: z.string().describe('The heading to put above the copy, e.g. "What is Tallybook?"'),
  body: z
    .string()
    .describe('The copy itself. Plain sentences. Use "- " list lines only when the instructions ask for a list. Unconfirmed facts appear only as their exact [confirm: …] token.'),
});

export type TFixDraft = z.infer<typeof fixDraftSchema>;
