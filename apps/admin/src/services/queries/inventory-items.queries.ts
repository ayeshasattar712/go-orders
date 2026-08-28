import { useQuery } from '@tanstack/react-query';
import { inventoryItemsService } from '@/services/api';

export const inventoryItemKeys = {
  all: ['inventory-items'] as const,
  list: () => [...inventoryItemKeys.all, 'list'] as const,
};

export function useInventoryItems() {
  return useQuery({
    queryKey: inventoryItemKeys.list(),
    queryFn: () => inventoryItemsService.list(),
  });
}
