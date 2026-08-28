import { useQuery } from '@tanstack/react-query';
import { warehousesService } from '@/services/api';

export const warehouseKeys = {
  all: ['warehouses'] as const,
  list: () => [...warehouseKeys.all, 'list'] as const,
};

export function useWarehouses() {
  return useQuery({
    queryKey: warehouseKeys.list(),
    queryFn: () => warehousesService.list(),
  });
}
