import { useQuery } from '@tanstack/react-query';
import { vendorPurchasesService } from '@/services/api';

export const vendorPurchaseKeys = {
  all: ['vendor-purchases'] as const,
  list: () => [...vendorPurchaseKeys.all, 'list'] as const,
};

export function useVendorPurchases() {
  return useQuery({
    queryKey: vendorPurchaseKeys.list(),
    queryFn: () => vendorPurchasesService.list(),
  });
}
