import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationsService } from '@/services/api';

export const quotationKeys = {
  all: ['quotations'] as const,
  list: () => [...quotationKeys.all, 'list'] as const,
};

export function useQuotations() {
  return useQuery({
    queryKey: quotationKeys.list(),
    queryFn: () => quotationsService.list(),
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}
