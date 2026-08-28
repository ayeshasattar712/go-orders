'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adminAuthService } from '@/services/api';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { ADMIN_DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export function useStaffLogout() {
  const router = useRouter();
  const logout = useStaffAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => adminAuthService.logout(),
    onSettled: () => {
      logout();
      router.replace(ADMIN_DEFAULT_LOGOUT_REDIRECT);
      router.refresh();
    },
  });
}
