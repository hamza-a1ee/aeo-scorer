import { z } from 'zod';

import { cappedArray } from './llm-schema.util';
import { CLAIM_KINDS, POSITIONS, SENTIMENTS, VERDICTS } from '@/types/enums/answer.enum';

/** LLM output for stage 6. Empty strings mean "none". */
export const judgeOutputSchema = z.object({
  mentioned: z.boolean().describe('Does the answer name the brand?'),
  position: z.enum(POSITIONS).describe('first = the brand is the first product recommended or the answer is about it; listed = named among others; absent = not named'),
  cited_our_pages: cappedArray(z.string(), 10).describe('Routes from OUR ROUTES that appear in the citations'),
  should_cite_route: z.string().describe('The route on our site that best answers this question, or "none" if no page covers it'),
  why: z.string().describe('One or two short sentences: why the brand was absent, misdescribed or not cited, pointing at the page or content gap. Plain words.'),
  sentiment: z.enum(SENTIMENTS).describe('Tone toward the brand; na when absent'),
  competitors_mentioned: cappedArray(z.string(), 15).describe('Other products named in the answer'),
  claims: cappedArray(
    z.object({
      text: z.string().describe('The claim about OUR brand, quoted or closely paraphrased from the answer'),
      kind: z.enum(CLAIM_KINDS),
      verdict: z.enum(VERDICTS),
      fact_key: z.string().describe('Key of the fact sheet entry it was checked against, or empty'),
      suggested_correction: z.string().describe('For wrong claims: the concrete site change that would prevent it. Else empty.'),
    }),
    12,
  ),
  ratings_quoted: cappedArray(
    z.object({
      platform: z.enum(['g2', 'capterra', 'app_store', 'google_play', 'trustpilot', 'other']),
      value: z.number(),
      count: z.number().describe('0 when not stated'),
    }),
    5,
  ),
  positive_themes: cappedArray(z.string(), 4).describe('Short praise themes repeated about the brand, 2-4 words each'),
  negative_themes: cappedArray(z.string(), 4).describe('Short criticism themes repeated about the brand, 2-4 words each'),
  review_sources: cappedArray(z.string(), 5).describe('Review sources named, e.g. "G2", "Reddit r/freelance"'),
});

export type TJudgeOutput = z.infer<typeof judgeOutputSchema>;
