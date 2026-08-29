import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tendersService } from '@/services/api';

export const tenderKeys = {
  all: ['tenders'] as const,
  list: () => [...tenderKeys.all, 'list'] as const,
};

export function useTenders() {
  return useQuery({
    queryKey: tenderKeys.list(),
    queryFn: () => tendersService.list(),
  });
}

export function useBidsByTender() {
  const { data } = useTenders();
  return data?.bidsByTender ?? {};
}

export function useQuotesByRfq() {
  const { data } = useTenders();
  return data?.quotesByRfq ?? {};
}

export function useTenderRfqs() {
  const { data } = useTenders();
  return data?.rfqs ?? [];
}

export function useCreateTender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tendersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenderKeys.all });
    },
  });
}
