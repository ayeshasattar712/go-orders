'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import { DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      router.replace(DEFAULT_LOGOUT_REDIRECT);
      router.refresh();
    },
  });
}
