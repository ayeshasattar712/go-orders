'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  Search,
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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { useStaffLogout } from '@/features/auth/hooks/use-staff-logout';

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

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const groups = adminGroups;
  const user = useStaffAuthStore((state) => state.user);
  const logout = useStaffLogout();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r md:flex">
        <div className="border-sidebar-border flex h-16 items-center gap-2.5 border-b px-5">
          <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-md shadow-primary/35">
            <Boxes className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm leading-none font-semibold text-white">GoOrder</p>
            <p className="text-primary text-[11px] font-medium tracking-wide">Admin panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-sidebar-muted px-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
                {group.label}
              </p>
              <div className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'text-sidebar-muted hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge variant="brand" className="bg-white/15 px-1.5 py-0 text-[10px] text-white">
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

        <div className="border-sidebar-border border-t p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium text-white">
              {ready ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : '\u00a0'}
            </p>
            <p className="text-sidebar-muted truncate text-xs">
              {ready ? (user?.email ?? '') : '\u00a0'}
            </p>
            <p className="text-primary mt-1 text-xs tracking-wide uppercase">
              {ready ? (user?.role ?? '') : '\u00a0'}
            </p>
          </div>
          <Button
            type="button"
            className="mb-1 w-full"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
          <Link
            href="/"
            className="text-sidebar-muted flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> Marketplace
          </Link>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-8">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
              Control panel
            </p>
            <h1 className="font-display text-lg leading-tight font-semibold">GoOrder Admin</h1>
          </div>
          <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              readOnly
              placeholder="Search orders, SKUs, vendors..."
              className="bg-muted/70 placeholder:text-muted-foreground h-10 w-full rounded-full border-0 pr-4 pl-10 text-sm outline-none"
            />
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
