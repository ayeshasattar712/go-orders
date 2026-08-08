import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/api';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    enabled,
    retry: false,
  });
}
