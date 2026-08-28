'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { customerAuthService } from '@/services/api';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { CUSTOMER_AUTH_ROUTES } from '@/constants/routes';

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setUser = useCustomerAuthStore((state) => state.setUser);
  const logout = useCustomerAuthStore((state) => state.logout);

  useEffect(() => {
    const isAuthRoute = CUSTOMER_AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isAuthRoute || pathname === '/') return;

    let cancelled = false;

    async function hydrateSession() {
      try {
        const user = await customerAuthService.me();
        if (!cancelled) setUser(user);
      } catch {
        if (!cancelled) logout();
      }
    }

    void hydrateSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, setUser, logout]);

  return <>{children}</>;
}
