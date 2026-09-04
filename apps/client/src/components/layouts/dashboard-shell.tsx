'use client';

import { useState } from 'react';
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
  Menu,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useChatStore } from '@/store/chat-store';
import { getClientByEmail } from '@/lib/mock-data/admin';
import { hasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/roles';
import { clientEnv } from '@/lib/env';
import type { User } from '@/types/auth';

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

function NavLinks({
  items,
  pathname,
  unreadChatCount,
  onNavigate,
}: {
  items: typeof navItems;
  pathname: string;
  unreadChatCount: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
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
  );
}

function AccountFooter({
  user,
  theme,
  setTheme,
  logoutPending,
  onLogout,
}: {
  user: User | null;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  logoutPending: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="border-t p-4">
      <div className="mb-3 min-w-0 text-sm">
        <p className="truncate font-medium">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-muted-foreground truncate">{user?.email}</p>
        <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">{user?.role}</p>
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
        onClick={onLogout}
        disabled={logoutPending}
      >
        <LogOut className="h-4 w-4" />
        {logoutPending ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
}

const mobileTabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/invoices', label: 'Bills', icon: Receipt },
  { href: '/chat', label: 'Chat', icon: MessagesSquare },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useCustomerAuthStore((state) => state.user);
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="bg-muted/30 flex min-h-dvh w-full max-w-[100vw] min-w-0 flex-col overflow-x-hidden">
      <aside className="bg-background fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-6 font-semibold">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </div>
        <NavLinks items={visibleNav} pathname={pathname} unreadChatCount={unreadChatCount} />
        <AccountFooter
          user={user}
          theme={theme}
          setTheme={setTheme}
          logoutPending={logout.isPending}
          onLogout={() => logout.mutate()}
        />
      </aside>

      <div className="flex w-full min-w-0 flex-1 flex-col lg:pl-64">
        <header className="bg-background/80 sticky top-0 z-20 flex min-h-14 w-full items-center gap-2 border-b px-3 py-2 backdrop-blur lg:min-h-16 lg:px-8">
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 gap-2 border-2 px-3 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            Menu
          </Button>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold capitalize lg:text-lg">
            {pathname.split('/').filter(Boolean)[0] ?? 'Dashboard'}
          </h1>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/home">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Back to marketplace</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </Button>
        </header>
        <main className="w-full min-w-0 flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {mobileTabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="text-muted-foreground flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[min(20rem,88vw)] max-w-[88vw] flex-col p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>{clientEnv.NEXT_PUBLIC_APP_NAME}</SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <NavLinks
              items={visibleNav}
              pathname={pathname}
              unreadChatCount={unreadChatCount}
              onNavigate={() => setMobileOpen(false)}
            />
            <AccountFooter
              user={user}
              theme={theme}
              setTheme={setTheme}
              logoutPending={logout.isPending}
              onLogout={() => logout.mutate()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
