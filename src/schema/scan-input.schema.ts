import { z } from 'zod';

import { isValidInputUrl } from '@/utils/url.util';

export const scanInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Enter your app’s website')
    .refine(isValidInputUrl, 'Enter a public website address, like yourapp.com'),
});

export type TScanInput = z.infer<typeof scanInputSchema>;
