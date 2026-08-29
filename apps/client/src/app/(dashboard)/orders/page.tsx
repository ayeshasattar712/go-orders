import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder, loadDeliveriesByOrderNumbers } from '@/lib/orders/order-mapper';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { DownloadOrderPdfButton } from '@/features/orders/components/download-order-pdf-button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = {
  title: 'Orders',
};

export default async function OrdersPage() {
  const session = await getCustomerSession();
  const records = session
    ? await prisma.order.findMany({
        where: { userId: session.sub },
        include: { items: true, timeline: true, payment: true },
        orderBy: { date: 'desc' },
      })
    : [];
  const deliveries = await loadDeliveriesByOrderNumbers(records.map((order) => order.orderNumber));
  const orders = records.map((order) => serializeOrder(order, deliveries.get(order.orderNumber)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Your orders</h2>
        <p className="text-muted-foreground">
          Track deliveries, download a PDF order form, and reorder easily.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {orders.map((order) => (
            <div
              key={order.id}
              className="hover:bg-muted/50 flex items-center justify-between gap-4 border-b p-4 last:border-0"
            >
              <Link href={`/orders/${order.orderNumber}`} className="min-w-0 flex-1">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-muted-foreground text-sm">
                  {order.vendorName} · {formatDate(order.date)} · {order.itemCount} items
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Tracking: <span className="font-mono">{order.trackingNumber}</span>
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-semibold">{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
                <DownloadOrderPdfButton orderNumber={order.orderNumber} />
                <Link href={`/orders/${order.orderNumber}`} aria-label="Open order">
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
