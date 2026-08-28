import { useQuery } from '@tanstack/react-query';
import { assetsService } from '@/services/api';

export const assetKeys = {
  all: ['assets'] as const,
  list: () => [...assetKeys.all, 'list'] as const,
};

export function useAssets() {
  return useQuery({
    queryKey: assetKeys.list(),
    queryFn: () => assetsService.list(),
  });
}
