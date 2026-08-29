'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { DownloadOrderPdfButton } from '@/features/orders/components/download-order-pdf-button';
import { useAdminOrders } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types/catalog';

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out-for-delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const { data: orders, isPending, isError } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (!orders) return [];
    return statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Process every customer order — confirm, ship, mark delivered, and save a PDF form.
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Loader label="Loading orders..." />
          ) : isError ? (
            <EmptyState title="Couldn't load orders" description="Please try again." />
          ) : filtered.length === 0 ? (
            <EmptyState title="No orders match this filter" description="Try a different status." />
          ) : (
            <div className="overflow-hidden rounded-xl border">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="hover:bg-muted/50 flex items-center justify-between gap-4 border-b p-4 last:border-0"
                >
                  <Link href={`/admin/orders/${order.orderNumber}`} className="min-w-0 flex-1">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-muted-foreground text-sm">
                      {order.customer ? `${order.customer.name} · ` : ''}
                      {order.vendorName} · {formatDate(order.date)} · {order.itemCount} items
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                    <DownloadOrderPdfButton orderNumber={order.orderNumber} />
                    <Link href={`/admin/orders/${order.orderNumber}`} aria-label="Open order">
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
