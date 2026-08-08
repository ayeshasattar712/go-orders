'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  UserRound,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { hasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/roles';
import { clientEnv } from '@/lib/env';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_READ },
  { href: '/users', label: 'Users', icon: Users, permission: PERMISSIONS.USERS_READ },
  { href: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.SETTINGS_READ },
  { href: '/profile', label: 'Profile', icon: UserRound, permission: PERMISSIONS.PROFILE_READ },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { theme, setTheme } = useTheme();

  const visibleNav = navItems.filter((item) => hasPermission(user, item.permission));

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6 font-semibold">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-3 text-sm">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {user?.role}
            </p>
          </div>
          <div className="mb-3 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              aria-label="Light theme"
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              aria-label="Dark theme"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              aria-label="System theme"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <h1 className="text-lg font-semibold capitalize">
            {pathname.split('/').filter(Boolean)[0] ?? 'Dashboard'}
          </h1>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
