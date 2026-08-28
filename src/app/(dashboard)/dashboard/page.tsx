import type { Metadata } from 'next';
import { AccountSummaryCards } from '@/features/dashboard/components/account-summary-cards';
import { RecentOrdersCard } from '@/features/dashboard/components/recent-orders-card';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import { FavoritesPreview } from '@/features/dashboard/components/favorites-preview';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your orders, invoices, and account.
        </p>
      </div>

      <AccountSummaryCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersCard />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <FavoritesPreview />
        </div>
      </div>
    </div>
  );
}
