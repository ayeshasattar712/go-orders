'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserRound,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Store,
  Receipt,
  Wallet,
  FileText,
  BellRing,
  MessagesSquare,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useChatStore } from '@/store/chat-store';
import { getClientByEmail } from '@/lib/mock-data/admin';
import { hasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/roles';
import { clientEnv } from '@/lib/env';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  { href: '/products', label: 'Shop', icon: Store, permission: PERMISSIONS.DASHBOARD_READ },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, permission: PERMISSIONS.DASHBOARD_READ },
  { href: '/orders', label: 'Orders', icon: ShoppingBag, permission: PERMISSIONS.DASHBOARD_READ },
  { href: '/invoices', label: 'Invoices', icon: Receipt, permission: PERMISSIONS.DASHBOARD_READ },
  { href: '/credit', label: 'Credit', icon: Wallet, permission: PERMISSIONS.DASHBOARD_READ },
  {
    href: '/quotations',
    label: 'Quotations',
    icon: FileText,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  { href: '/favorites', label: 'Favorites', icon: Heart, permission: PERMISSIONS.PROFILE_READ },
  {
    href: '/chat',
    label: 'Chat with GoOrder',
    icon: MessagesSquare,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: BellRing,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  { href: '/profile', label: 'Profile', icon: UserRound, permission: PERMISSIONS.PROFILE_READ },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useCustomerAuthStore((state) => state.user);
  const logout = useLogout();
  const { theme, setTheme } = useTheme();

  const visibleNav = navItems.filter((item) => hasPermission(user, item.permission));
  const client = user ? getClientByEmail(user.email) : undefined;
  const unreadChatCount = useChatStore((state) =>
    client
      ? state.threads
          .filter((thread) => thread.clientId === client.id)
          .reduce((sum, thread) => sum + thread.unreadForCustomer, 0)
      : 0,
  );

  return (
    <div className="bg-muted/30 min-h-screen">
      <aside className="bg-background fixed inset-y-0 left-0 z-30 hidden w-64 border-r md:flex md:flex-col">
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
                {item.href === '/chat' && unreadChatCount > 0 ? (
                  <span className="bg-destructive text-destructive-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                    {unreadChatCount}
                  </span>
                ) : null}
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
            <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">
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
        <header className="bg-background/80 sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-8">
          <h1 className="text-lg font-semibold capitalize">
            {pathname.split('/').filter(Boolean)[0] ?? 'Dashboard'}
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/home">
              <Store className="h-4 w-4" /> Back to marketplace
            </Link>
          </Button>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
