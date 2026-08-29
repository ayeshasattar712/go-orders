import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rfqRequestsService } from '@/services/api';
import type { TendersResponse } from '@/services/api/tenders.service';
import { tenderKeys } from './tenders.queries';
import type { RfqRequest } from '@/types/enterprise';

export const rfqKeys = {
  all: ['rfq-requests'] as const,
  list: () => [...rfqKeys.all, 'list'] as const,
};

export function useRfqRequests() {
  return useQuery({
    queryKey: rfqKeys.list(),
    queryFn: () => rfqRequestsService.list(),
  });
}

export function useCreateRfqRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rfqRequestsService.create,
    onSuccess: (rfq) => {
      queryClient.setQueryData<RfqRequest[]>(rfqKeys.list(), (current = []) => [rfq, ...current]);
      queryClient.setQueryData<TendersResponse | undefined>(tenderKeys.list(), (current) =>
        current ? { ...current, rfqs: [rfq, ...current.rfqs] } : current,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
      queryClient.invalidateQueries({ queryKey: tenderKeys.all });
    },
  });
}
