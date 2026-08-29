'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
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
import { OrderTimeline } from '@/features/orders/components/order-timeline';
import { TrackingNumberCard } from '@/features/orders/components/tracking-number-card';
import { DownloadOrderPdfButton } from '@/features/orders/components/download-order-pdf-button';
import { DownloadChallanPdfButton } from '@/features/delivery/download-challan-pdf-button';
import { useAdminOrder, useUpdateOrderStatus } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types/catalog';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out-for-delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order, isPending, isError } = useAdminOrder(orderNumber);
  const updateStatus = useUpdateOrderStatus();

  if (isPending) return <Loader label="Loading order..." />;
  if (isError || !order) {
    return <EmptyState title="Order not found" description="This order may have been removed." />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.date)} · {order.vendorName}
            {order.customer
              ? ` · ${order.customer.name} (${order.customer.email})`
              : ' · Guest order'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadOrderPdfButton orderNumber={order.orderNumber} variant="outline" />
          <DownloadChallanPdfButton orderNumber={order.orderNumber} />
          <Select
            value={order.status}
            onValueChange={(value) =>
              updateStatus.mutate({ orderNumber: order.orderNumber, status: value as OrderStatus })
            }
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fulfillment timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingNumberCard trackingNumber={order.trackingNumber} carrier={order.carrier} />
            <OrderTimeline steps={order.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 text-sm font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
