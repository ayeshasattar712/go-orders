'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import { AUTH_ROUTES } from '@/constants/routes';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const isAuthRoute = AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isAuthRoute || pathname === '/') return;

    let cancelled = false;

    async function hydrateSession() {
      try {
        const user = await authService.me();
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
