import type { TScanStage } from '@/types/enums/scan.enum';

export interface IStageMeta {
  stage: TScanStage;
  order: number;
  title: string;
  description: string;
}

/** The seven pipeline stages, in run order, as the Run page lists them. */
export const STAGE_META: IStageMeta[] = [
  {
    stage: 'crawl',
    order: 1,
    title: 'Crawl',
    description: 'robots.txt, sitemap.xml, llms.txt and up to 50 pages.',
  },
  {
    stage: 'health',
    order: 2,
    title: 'Site health checks',
    description: 'Bot access, schema, freshness on every route.',
  },
  {
    stage: 'facts',
    order: 3,
    title: 'Fact sheet',
    description: 'What your site says, with the quote and page for each fact.',
  },
  {
    stage: 'questions',
    order: 4,
    title: 'Buyer questions',
    description: '20 questions across six intents.',
  },
  {
    stage: 'engines',
    order: 5,
    title: 'Ask engines',
    description: 'Every question, with sources cited.',
  },
  {
    stage: 'judge',
    order: 6,
    title: 'Judge answers',
    description: 'Each answer checked against the fact sheet.',
  },
  {
    stage: 'report',
    order: 7,
    title: 'Score and draft fixes',
    description: 'Score, locate every issue, write the fixes.',
  },
];

export const STAGE_BY_KEY = Object.fromEntries(
  STAGE_META.map(s => [s.stage, s]),
) as Record<TScanStage, IStageMeta>;
