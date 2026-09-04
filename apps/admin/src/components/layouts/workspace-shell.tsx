'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  LayoutGrid,
  PackageCheck,
  ClipboardList,
  Warehouse,
  Truck,
  Receipt,
  Calculator,
  MessagesSquare,
  Sparkles,
  Wrench,
  Gavel,
  Store,
  Tags,
  Package,
  Users,
  Wallet,
  BellRing,
  Banknote,
  ShoppingBasket,
  Settings,
  LogOut,
  Menu,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { useStaffLogout } from '@/features/auth/hooks/use-staff-logout';
import type { User } from '@/types/auth';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Admin Dashboard', icon: LayoutGrid },
      { href: '/bi', label: 'Business Intelligence', icon: Sparkles },
    ],
  },
  {
    label: 'Sales',
    items: [{ href: '/admin/orders', label: 'Orders', icon: PackageCheck }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/categories', label: 'Categories', icon: Tags },
      { href: '/admin/products', label: 'Products', icon: Package },
    ],
  },
  {
    label: 'Partners',
    items: [
      { href: '/admin/vendors', label: 'Vendors', icon: Store },
      { href: '/admin/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/credit', label: 'Credit Management', icon: Wallet },
      { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
      { href: '/admin/invoices/alerts', label: 'Invoice Alerts', icon: BellRing },
      { href: '/admin/payments', label: 'Payments received', icon: Banknote },
      { href: '/accounting', label: 'Accounting ERP', icon: Calculator },
      { href: '/admin/purchases', label: 'Vendor Purchases', icon: ShoppingBasket },
    ],
  },
  {
    label: 'Supply Chain',
    items: [
      { href: '/procurement', label: 'Procurement', icon: ClipboardList },
      { href: '/inventory', label: 'Inventory', icon: Warehouse },
      { href: '/delivery', label: 'Delivery', icon: Truck },
      { href: '/tenders', label: 'Tenders', icon: Gavel },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/admin/chat', label: 'Client Chat', icon: MessagesSquare },
      { href: '/crm', label: 'CRM & Support', icon: MessagesSquare },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/ai-forecasting', label: 'AI Forecasting', icon: Sparkles, badge: 'AI' },
      { href: '/assets', label: 'Asset Management', icon: Wrench },
    ],
  },
  {
    label: 'Staff',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const mobileTabs: { href: string; label: string; icon: LucideIcon; isMenu?: boolean }[] = [
  { href: '/admin', label: 'Home', icon: LayoutGrid },
  { href: '/admin/orders', label: 'Orders', icon: PackageCheck },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { href: '#more', label: 'More', icon: Menu, isMenu: true },
];

function isNavActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNav({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-sidebar-muted px-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
            {group.label}
          </p>
          <div className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-primary/30 shadow-lg'
                      : 'text-sidebar-muted hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <Badge
                      variant="brand"
                      className="bg-white/15 px-1.5 py-0 text-[10px] text-white"
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AccountBlock({
  user,
  ready,
  logoutPending,
  onLogout,
}: {
  user: User | null;
  ready: boolean;
  logoutPending: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="border-sidebar-border border-t p-3">
      <div className="mb-2 px-3 text-sm">
        <p className="truncate font-medium text-white">
          {ready ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : '\u00a0'}
        </p>
        <p className="text-sidebar-muted truncate text-xs">
          {ready ? (user?.email ?? '') : '\u00a0'}
        </p>
        <p className="text-primary mt-1 text-xs tracking-wide uppercase">
          {ready ? (user?.role ?? '') : '\u00a0'}
        </p>
      </div>
      <Button type="button" className="mb-1 w-full" onClick={onLogout} disabled={logoutPending}>
        <LogOut className="h-4 w-4" />
        {logoutPending ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const groups = adminGroups;
  const user = useStaffAuthStore((state) => state.user);
  const ready = useStaffAuthStore((state) => state.isHydrated);
  const logout = useStaffLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  function openMenu() {
    setMobileOpen(true);
  }

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] min-w-0 flex-col overflow-x-hidden bg-[#f8f9fa]">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r lg:flex">
        <div className="border-sidebar-border flex h-16 items-center gap-2.5 border-b px-5">
          <span className="bg-hero-gradient shadow-primary/35 flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-md">
            <Boxes className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm leading-none font-semibold text-white">GoOrder</p>
            <p className="text-primary text-[11px] font-medium tracking-wide">Admin panel</p>
          </div>
        </div>

        <AdminNav groups={groups} pathname={pathname} />

        <AccountBlock
          user={user}
          ready={ready}
          logoutPending={logout.isPending}
          onLogout={() => logout.mutate()}
        />
        <div className="border-sidebar-border border-t px-3 pb-3">
          <Link
            href="/"
            className="text-sidebar-muted flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> Marketplace
          </Link>
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-14 w-full items-center gap-2 border-b bg-white px-3 py-2 lg:min-h-16 lg:px-8">
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 gap-2 border-2 px-3 lg:hidden"
            onClick={openMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            Menu
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground hidden text-[11px] font-semibold tracking-[0.18em] uppercase lg:block">
              Control panel
            </p>
            <h1 className="font-display truncate text-base leading-tight font-semibold lg:text-lg">
              GoOrder Admin
            </h1>
          </div>
        </header>

        <main className="w-full min-w-0 flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          <div className="w-full max-w-full min-w-0">{children}</div>
        </main>
      </div>

      <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {mobileTabs.map((tab) => {
            const active = !tab.isMenu && isNavActive(pathname, tab.href);
            const className = cn(
              'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium',
              active ? 'text-primary' : 'text-muted-foreground',
            );
            if (tab.isMenu) {
              return (
                <li key={tab.label}>
                  <button type="button" className={cn(className, 'w-full')} onClick={openMenu}>
                    <tab.icon className="h-5 w-5" />
                    More
                  </button>
                </li>
              );
            }
            return (
              <li key={tab.href}>
                <Link href={tab.href} className={className}>
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="bg-sidebar text-sidebar-foreground border-sidebar-border flex w-[min(20rem,88vw)] max-w-[88vw] flex-col p-0 [&>button]:text-white"
        >
          <SheetHeader className="border-sidebar-border border-b px-5 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-white">
              <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-2xl text-white">
                <Boxes className="h-4 w-4" />
              </span>
              GoOrder Admin
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <AdminNav groups={groups} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <AccountBlock
              user={user}
              ready={ready}
              logoutPending={logout.isPending}
              onLogout={() => logout.mutate()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
