import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder, loadDeliveriesByOrderNumbers } from '@/lib/orders/order-mapper';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function RecentOrdersCard() {
  const session = await getCustomerSession();
  const records = session
    ? await prisma.order.findMany({
        where: { userId: session.sub },
        include: { items: true, timeline: true, payment: true },
        orderBy: { date: 'desc' },
        take: 3,
      })
    : [];
  const deliveries = await loadDeliveriesByOrderNumbers(records.map((order) => order.orderNumber));
  const orders = records.map((order) => serializeOrder(order, deliveries.get(order.orderNumber)));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders you place will show up here."
            className="border-0 py-6"
          />
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.orderNumber}`}
              className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg px-2 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                <p className="text-muted-foreground text-xs">
                  {order.vendorName} · {formatDate(order.date)} · {order.itemCount} items
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
