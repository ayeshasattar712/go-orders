'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { customerAuthService } from '@/services/api';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { CUSTOMER_DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export function useLogout() {
  const router = useRouter();
  const logout = useCustomerAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => customerAuthService.logout(),
    onSettled: () => {
      logout();
      router.replace(CUSTOMER_DEFAULT_LOGOUT_REDIRECT);
      router.refresh();
    },
  });
}
