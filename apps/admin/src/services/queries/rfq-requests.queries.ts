import { useQuery } from '@tanstack/react-query';
import { rfqRequestsService } from '@/services/api';

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
