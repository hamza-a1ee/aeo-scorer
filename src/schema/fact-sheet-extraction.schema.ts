import { z } from 'zod';

import { cappedArray } from './llm-schema.util';
import { FACT_KEYS } from '@/constants/fact-catalog.constant';
import { FACT_STATUSES, RATING_PLATFORMS } from '@/types/enums/fact.enum';

/** LLM output for stage 3. Empty strings mean "not stated". */
export const factSheetExtractionSchema = z.object({
  brand_name: z.string().describe('The product name as the site writes it'),
  facts: cappedArray(
    z.object({
      key: z.enum(FACT_KEYS),
      label: z.string().describe('For feature_N keys: the feature name. Otherwise repeat the catalog label.'),
      value: z.string().describe('Short factual value. Empty string when the site does not state it.'),
      status: z.enum(FACT_STATUSES),
      note: z.string().describe('Why it is ambiguous or missing. Empty string when status is ok.'),
      source_route: z.string().describe('Route of the page the quote comes from, e.g. /pricing. Empty when missing.'),
      source_quote: z.string().describe('Exact sentence copied verbatim from that page. Empty when missing.'),
    }),
    30,
  ),
  competitors: cappedArray(z.object({ name: z.string(), source_route: z.string() }), 10),
  ratings: cappedArray(
    z.object({
      platform: z.enum(RATING_PLATFORMS),
      value: z.number().describe('Star rating, e.g. 4.6'),
      count: z.number().describe('Number of reviews, 0 when not shown'),
      source_route: z.string(),
    }),
    5,
  ),
});

export type TFactSheetExtraction = z.infer<typeof factSheetExtractionSchema>;
