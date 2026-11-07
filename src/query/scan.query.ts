import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/constants/app-routes.constant';
import { FactSheetService } from '@/services/fact-sheet.service';
import { ReportService } from '@/services/report.service';
import { ScanService, scanService } from '@/services/scan.service';
import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type {
  ICreateScanPayload,
  IScanStatus,
} from '@/types/interfaces/scan.interface';
import { throwError } from '@/utils/react-query.util';

const ACTIVE = ['queued', 'running'];

export function useCreateScan() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ICreateScanPayload) => scanService.createScan(payload),
    mutationKey: [ScanService.keyFactory.create],
    onSuccess: res => {
      if (res.data) router.push(APP_ROUTES.scan(res.data.scanId));
    },
    onError: throwError('Could not start the scan'),
  });
}

/** Polls every 2 s while the scan is queued or running. */
export function useScanStatus(id: string) {
  return useQuery<IAPIResponse<IScanStatus>>({
    queryKey: [ScanService.keyFactory.status, id],
    queryFn: () => scanService.getStatus(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: query =>
      ACTIVE.includes(query.state.data?.data?.status ?? 'queued') &&
      !query.state.error
        ? 2000
        : false,
  });
}

export function useSkipToPartial(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scanService.skip(id),
    mutationKey: [ScanService.keyFactory.skip, id],
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [ScanService.keyFactory.status, id],
      }),
    onError: throwError('Could not skip ahead'),
  });
}

export function useRejudge(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => scanService.rejudge(id),
    mutationKey: [ScanService.keyFactory.rejudge, id],
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [ScanService.keyFactory.status, id],
        }),
        queryClient.invalidateQueries({
          queryKey: [FactSheetService.keyFactory.factSheet, id],
        }),
        queryClient.invalidateQueries({
          queryKey: [ReportService.keyFactory.report],
        }),
      ]);
      router.push(APP_ROUTES.scan(id));
    },
    onError: throwError('Could not re-judge the answers'),
  });
}
