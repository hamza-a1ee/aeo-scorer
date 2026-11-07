import type { IReport } from '@/types/interfaces/report.interface';

export const EXPORT_SECTIONS = ['all', 'gaps', 'routes', 'fixes', 'claims'] as const;
export type TExportSectionKey = (typeof EXPORT_SECTIONS)[number];

type TCell = string | number | boolean | null | undefined;

const cell = (v: TCell) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: TCell[][]) => rows.map(r => r.map(cell).join(',')).join('\r\n');

function section(report: IReport, key: Exclude<TExportSectionKey, 'all'>): TCell[][] {
  switch (key) {
    case 'gaps':
      return [
        ['Question', 'Intent', 'Weight', ...report.engines.map(e => `Position · ${e}`), 'Cited from your site', 'Page that should be cited', 'Why'],
        ...report.gaps.rows.map(r => [
          r.question,
          r.intent,
          r.doubled ? 2 : 1,
          ...report.engines.map(e => r.positions.find(p => p.engine === e)?.position ?? ''),
          r.cited ?? '',
          r.shouldCite ?? '',
          r.why,
        ]),
      ];
    case 'routes':
      return [
        ['Route', 'Type', 'Crawler access', 'Readable without JS', 'Schema', 'Last updated', 'Issues'],
        ...report.siteHealth.routes.map(r => [
          r.route,
          r.type,
          r.access,
          r.readable === null ? '' : r.readable ? 'Yes' : 'No',
          r.schema,
          r.lastUpdated ?? 'none shown',
          r.issues.map(i => `${i.label}: ${i.detail}`).join(' | '),
        ]),
      ];
    case 'fixes':
      return [
        ['Rank', 'Fix', 'Lift (points)', 'Effort', 'Route', 'Gap', 'Why', 'Done'],
        ...report.fixes.map(f => [f.rank, f.title, f.liftPoints, f.effort, f.route, f.gap, f.why, f.done]),
      ];
    case 'claims':
      return [
        ['Kind', 'Engine', 'What the engine said', 'Question', 'Your fact sheet says', 'Source', 'Suggested correction'],
        ...report.accuracy.wrong.map(c => [c.kind, c.engineLabel, c.said, c.question, c.truth, c.source ?? '', c.correction]),
      ];
  }
}

export function reportToCsv(report: IReport, key: TExportSectionKey): string {
  if (key !== 'all') return toCsv(section(report, key));
  const head: TCell[][] = [
    ['AEO report', report.brandName, report.domain],
    ['Score', report.score.total, report.score.grade],
    ...report.score.subScores.map(s => [s.name, s.value, `of ${s.max}`]),
  ];
  const parts = (['gaps', 'routes', 'fixes', 'claims'] as const).map(k => toCsv([[k.toUpperCase()], ...section(report, k)]));
  return [toCsv(head), ...parts].join('\r\n\r\n');
}
