import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { RATING_LABELS } from '@/constants/ratings.constant';
import {
  FactSheetService,
  factSheetService,
} from '@/services/fact-sheet.service';
import type { IAPIResponse } from '@/types/interfaces/api-response.interface';
import type {
  ICompetitorPayload,
  IFactPatchPayload,
  IFactSheet,
  IRatingPatchPayload,
} from '@/types/interfaces/fact-sheet.interface';
import { throwError } from '@/utils/react-query.util';

type TSheet = IAPIResponse<IFactSheet>;

const sheetKey = (scanId: string) => [
  FactSheetService.keyFactory.factSheet,
  scanId,
];

export function useFactSheet(scanId: string) {
  return useQuery<TSheet>({
    queryKey: sheetKey(scanId),
    queryFn: () => factSheetService.getFactSheet(scanId),
    enabled: !!scanId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Shared optimistic-update wiring: cancel in-flight fetches, snapshot,
 * patch the cache, roll back on error, refetch when settled.
 */
function useOptimisticSheetMutation<TVars>(
  scanId: string,
  mutationKey: string,
  mutationFn: (vars: TVars) => Promise<unknown>,
  patch: (sheet: IFactSheet, vars: TVars) => IFactSheet,
  errorTitle: string,
) {
  const queryClient = useQueryClient();
  const key = sheetKey(scanId);
  return useMutation({
    mutationKey: [mutationKey, scanId],
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<TSheet>(key);
      if (prev?.data) {
        queryClient.setQueryData<TSheet>(key, {
          ...prev,
          data: patch(prev.data, vars),
        });
      }
      return { prev };
    },
    onError: (error, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
      throwError(errorTitle)(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateFact(scanId: string) {
  return useOptimisticSheetMutation<{ factId: number } & IFactPatchPayload>(
    scanId,
    FactSheetService.keyFactory.updateFact,
    ({ factId, value }) => factSheetService.updateFact(scanId, factId, { value }),
    (sheet, { factId, value }) => ({
      ...sheet,
      groups: sheet.groups.map(g => ({
        ...g,
        facts: g.facts.map(f =>
          f.id === factId
            ? {
                ...f,
                value,
                status: value ? 'ok' : 'missing',
                confirmed: !!value,
                note: null,
                editedByUser: true,
              }
            : f,
        ),
      })),
    }),
    'Could not save the fact',
  );
}

export function useAddCompetitor(scanId: string) {
  return useOptimisticSheetMutation<ICompetitorPayload>(
    scanId,
    FactSheetService.keyFactory.addCompetitor,
    payload => factSheetService.addCompetitor(scanId, payload),
    (sheet, { name }) => ({
      ...sheet,
      competitors: [
        ...sheet.competitors,
        { id: -Date.now(), name, origin: 'user', sourceRoute: null },
      ],
    }),
    'Could not add the competitor',
  );
}

export function useRemoveCompetitor(scanId: string) {
  return useOptimisticSheetMutation<number>(
    scanId,
    FactSheetService.keyFactory.removeCompetitor,
    competitorId => factSheetService.removeCompetitor(scanId, competitorId),
    (sheet, competitorId) => ({
      ...sheet,
      competitors: sheet.competitors.filter(c => c.id !== competitorId),
    }),
    'Could not remove the competitor',
  );
}

export function useUpdateRating(scanId: string) {
  return useOptimisticSheetMutation<IRatingPatchPayload>(
    scanId,
    FactSheetService.keyFactory.updateRating,
    payload => factSheetService.updateRating(scanId, payload),
    (sheet, { platform, value, count }) => ({
      ...sheet,
      ratings: sheet.ratings.some(r => r.platform === platform)
        ? sheet.ratings.map(r =>
            r.platform === platform
              ? { ...r, value, count: count === undefined ? r.count : count, origin: 'user' }
              : r,
          )
        : [
            ...sheet.ratings,
            {
              platform,
              label: RATING_LABELS[platform],
              value,
              count: count ?? null,
              sourceUrl: null,
              origin: 'user',
            },
          ],
    }),
    'Could not save the rating',
  );
}
