import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Download, MessageCircle } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder } from '@/lib/orders/order-mapper';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { OrderTimeline } from '@/features/orders/components/order-timeline';
import { CustomerDeliveryTracker } from '@/features/delivery/customer-delivery-tracker';
import { TrackingNumberCard } from '@/features/orders/components/tracking-number-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Order Details',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getCustomerSession();
  const record = session
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, timeline: true },
      })
    : null;

  // Ownership check — a customer can never view another customer's order.
  if (!record || record.userId !== session?.sub) notFound();
  const order = serializeOrder(record);

  return (
    <div className="space-y-6">
      <Link
        href="/orders"
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
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Invoice
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" /> Contact vendor
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingNumberCard trackingNumber={order.trackingNumber} carrier={order.carrier} />
            <CustomerDeliveryTracker orderNumber={order.orderNumber} fallbackEta={order.eta} />
            <OrderTimeline steps={order.timeline} />

            {order.status === 'delivered' ? (
              <div className="border-success/30 bg-success/5 mt-6 rounded-lg border p-4 text-sm">
                <p className="text-success font-medium">Proof of delivery</p>
                <p className="text-muted-foreground mt-1">
                  Signed for by front desk staff. Delivery photo and signature are available in the
                  carrier portal.
                </p>
              </div>
            ) : null}
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
