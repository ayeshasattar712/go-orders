import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/api';

export const productsKeys = {
  all: ['products'] as const,
  list: () => [...productsKeys.all, 'list'] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: () => productsService.list(),
    staleTime: 60_000,
  });
}
