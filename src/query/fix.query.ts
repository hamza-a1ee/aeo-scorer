import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { FixService, fixService } from '@/services/fix.service';
import { ReportService } from '@/services/report.service';
import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type { IFix, IFixSummary } from '@/types/interfaces/fix.interface';
import { throwError } from '@/utils/react-query.util';

export function useFixes(token: string) {
  return useQuery<IAPIResponse<IFixSummary[]>>({
    queryKey: [FixService.keyFactory.fixes, token],
    queryFn: () => fixService.list(token),
    enabled: !!token,
  });
}

export function useFix(token: string, fixId: number) {
  return useQuery<IAPIResponse<IFix>>({
    queryKey: [FixService.keyFactory.fix, token, fixId],
    queryFn: () => fixService.getFix(token, fixId),
    enabled: !!token && Number.isFinite(fixId),
  });
}

function useFixCacheSync(token: string, fixId: number) {
  const queryClient = useQueryClient();
  return (res: IAPIResponse<IFix>) => {
    queryClient.setQueryData([FixService.keyFactory.fix, token, fixId], res);
    queryClient.invalidateQueries({ queryKey: [FixService.keyFactory.fixes, token] });
    queryClient.invalidateQueries({ queryKey: [ReportService.keyFactory.report, token] });
  };
}

export function useRegenerateFix(token: string, fixId: number) {
  const sync = useFixCacheSync(token, fixId);
  return useMutation({
    mutationKey: [FixService.keyFactory.regenerate, token, fixId],
    mutationFn: () => fixService.regenerate(token, fixId),
    onSuccess: res => {
      sync(res);
      toast.success('New draft written');
    },
    onError: throwError('Could not regenerate the draft'),
  });
}

export function useToggleFixDone(token: string, fixId: number) {
  const sync = useFixCacheSync(token, fixId);
  return useMutation({
    mutationKey: [FixService.keyFactory.toggleDone, token, fixId],
    mutationFn: (done: boolean) => fixService.setDone(token, fixId, done),
    onSuccess: sync,
    onError: throwError('Could not update the fix'),
  });
}
