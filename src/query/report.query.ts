import { useQuery } from '@tanstack/react-query';

import { ReportService, reportService } from '@/services/report.service';
import type { TExportSection } from '@/services/report.service';
import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type { IReport } from '@/types/interfaces/report.interface';
import { getErrorStatus } from '@/utils/axios.util';

/** Retries while the report is still being built (409). */
export function useReport(token: string) {
  return useQuery<IAPIResponse<IReport>>({
    queryKey: [ReportService.keyFactory.report, token],
    queryFn: () => reportService.getReport(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    retry: (count, error) => getErrorStatus(error) === 409 && count < 60,
    retryDelay: 3000,
  });
}

export function useExportCsv(token: string) {
  return (section: TExportSection = 'all') => {
    window.location.assign(reportService.exportUrl(token, section));
  };
}
