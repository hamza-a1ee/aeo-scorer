export const APP_ROUTES = {
  home: '/',
  scan: (id: string) => `/scan/${id}`,
  facts: (id: string) => `/scan/${id}/facts`,
  report: (token: string) => `/report/${token}`,
  fix: (token: string, fixId: string | number) => `/report/${token}/fix/${fixId}`,
  howScoringWorks: '/how-scoring-works',
  ourCrawler: '/our-crawler',
  sampleReport: '/report/sample',
};

/** Read-only demo data id/token, served without a database or API keys. */
export const SAMPLE_ID = 'sample';
