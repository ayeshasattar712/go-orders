import { useQuery } from '@tanstack/react-query';
import { customerAuthService } from '@/services/api';

export const customerAuthKeys = {
  all: ['customer-auth'] as const,
  me: () => [...customerAuthKeys.all, 'me'] as const,
};

export function useCurrentCustomer(enabled = true) {
  return useQuery({
    queryKey: customerAuthKeys.me(),
    queryFn: () => customerAuthService.me(),
    enabled,
    retry: false,
  });
}
