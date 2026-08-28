'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { adminAuthService } from '@/services/api';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { ADMIN_AUTH_ROUTES } from '@/constants/routes';

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setUser = useStaffAuthStore((state) => state.setUser);
  const logout = useStaffAuthStore((state) => state.logout);

  useEffect(() => {
    const isAuthRoute = ADMIN_AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isAuthRoute) return;

    let cancelled = false;

    async function hydrateSession() {
      try {
        const user = await adminAuthService.me();
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
