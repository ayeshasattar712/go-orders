import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotationsService } from '@/services/api';
import type { Quotation } from '@/types/admin';

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

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Quotation['status'] }) =>
      quotationsService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all });
    },
  });
}
