import { useQuery } from '@tanstack/react-query';
import { adminAuthService } from '@/services/api';

export const adminAuthKeys = {
  all: ['admin-auth'] as const,
  me: () => [...adminAuthKeys.all, 'me'] as const,
};

export function useCurrentStaffMember(enabled = true) {
  return useQuery({
    queryKey: adminAuthKeys.me(),
    queryFn: () => adminAuthService.me(),
    enabled,
    retry: false,
  });
}
