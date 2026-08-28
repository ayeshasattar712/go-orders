import { useQuery } from '@tanstack/react-query';
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
