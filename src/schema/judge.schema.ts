import { z } from 'zod';

import { CLAIM_KINDS, POSITIONS, SENTIMENTS, VERDICTS } from '@/types/enums/answer.enum';

/** LLM output for stage 6. Empty strings mean "none". */
export const judgeOutputSchema = z.object({
  mentioned: z.boolean().describe('Does the answer name the brand?'),
  position: z.enum(POSITIONS).describe('first = the brand is the first product recommended or the answer is about it; listed = named among others; absent = not named'),
  cited_our_pages: z.array(z.string()).max(10).describe('Routes from OUR ROUTES that appear in the citations'),
  should_cite_route: z.string().describe('The route on our site that best answers this question, or "none" if no page covers it'),
  why: z.string().describe('One or two short sentences: why the brand was absent, misdescribed or not cited, pointing at the page or content gap. Plain words.'),
  sentiment: z.enum(SENTIMENTS).describe('Tone toward the brand; na when absent'),
  competitors_mentioned: z.array(z.string()).max(15).describe('Other products named in the answer'),
  claims: z
    .array(
      z.object({
        text: z.string().describe('The claim about OUR brand, quoted or closely paraphrased from the answer'),
        kind: z.enum(CLAIM_KINDS),
        verdict: z.enum(VERDICTS),
        fact_key: z.string().describe('Key of the fact sheet entry it was checked against, or empty'),
        suggested_correction: z.string().describe('For wrong claims: the concrete site change that would prevent it. Else empty.'),
      }),
    )
    .max(12),
  ratings_quoted: z
    .array(
      z.object({
        platform: z.enum(['g2', 'capterra', 'app_store', 'google_play', 'trustpilot', 'other']),
        value: z.number(),
        count: z.number().describe('0 when not stated'),
      }),
    )
    .max(5),
  positive_themes: z.array(z.string()).max(4).describe('Short praise themes repeated about the brand, 2-4 words each'),
  negative_themes: z.array(z.string()).max(4).describe('Short criticism themes repeated about the brand, 2-4 words each'),
  review_sources: z.array(z.string()).max(5).describe('Review sources named, e.g. "G2", "Reddit r/freelance"'),
});

export type TJudgeOutput = z.infer<typeof judgeOutputSchema>;
