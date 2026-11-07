import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type { IReport } from '@/types/interfaces/report.interface';

import { APIService } from './base.service';

export type TExportSection = 'all' | 'gaps' | 'routes' | 'fixes' | 'claims';

export class ReportService extends APIService {
  public static readonly keyFactory = {
    report: 'report',
  };

  async getReport(token: string): Promise<IAPIResponse<IReport>> {
    return (await this.get(`/reports/${token}`)).data;
  }

  exportUrl(token: string, section: TExportSection = 'all'): string {
    return `/api/reports/${token}/export?section=${section}`;
  }
}

export const reportService = new ReportService();
