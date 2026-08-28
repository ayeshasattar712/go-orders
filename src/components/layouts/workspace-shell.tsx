'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  LayoutGrid,
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

  return (
    <div className="bg-muted/20 min-h-screen">
      <aside className="bg-card fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="bg-hero-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
            <Boxes className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm leading-none font-bold">GoOrder</p>
            <p className="text-muted-foreground text-[11px]">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-muted-foreground px-3 text-[11px] font-semibold tracking-wider uppercase">
                {group.label}
              </p>
              <div className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge variant="brand" className="px-1.5 py-0 text-[10px]">
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

        <div className="border-t p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">
              {user?.role}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mb-1 w-full"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
          <Link
            href="/"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
          >
            <Store className="h-4 w-4" /> Back to marketplace
          </Link>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="bg-background/85 sticky top-0 z-20 flex h-16 items-center border-b px-4 backdrop-blur md:px-8">
          <h1 className="text-lg font-semibold">GoOrder Admin Panel</h1>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
