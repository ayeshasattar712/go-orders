import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Download, MessageCircle } from 'lucide-react';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { serializeOrder, loadDeliveriesByOrderNumbers } from '@/lib/orders/order-mapper';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { OrderTimeline } from '@/features/orders/components/order-timeline';
import { OrderJourney } from '@/features/orders/components/order-journey';
import { CustomerDeliveryTracker } from '@/features/delivery/customer-delivery-tracker';
import { TrackingNumberCard } from '@/features/orders/components/tracking-number-card';
import { DownloadOrderPdfButton } from '@/features/orders/components/download-order-pdf-button';
import { DownloadChallanPdfButton } from '@/features/delivery/download-challan-pdf-button';
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
        include: { items: true, timeline: true, payment: true },
      })
    : null;

  // Ownership check — a customer can never view another customer's order.
  if (!record || record.userId !== session?.sub) notFound();
  const order = serializeOrder(
    record,
    (await loadDeliveriesByOrderNumbers([record.orderNumber])).get(record.orderNumber),
  );

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
          <DownloadOrderPdfButton orderNumber={order.orderNumber} variant="outline" />
          <DownloadChallanPdfButton orderNumber={order.orderNumber} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices">
              <Download className="h-4 w-4" /> Invoice
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/chat">
              <MessageCircle className="h-4 w-4" /> Chat with GoOrder
            </Link>
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
            <OrderJourney order={order} />
            <CustomerDeliveryTracker order={order} fallbackEta={order.eta} />
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

        <div className="space-y-6">
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
          {order.payment ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment & invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  {order.payment.method === 'bank-account' ? 'Bank transfer' : 'Online transfer'}
                </p>
                <p className="text-muted-foreground">Ref: {order.payment.reference}</p>
                {order.payment.transferReference ? (
                  <p className="text-muted-foreground">Txn: {order.payment.transferReference}</p>
                ) : null}
                <p className="font-medium">{formatCurrency(order.payment.amount)} · confirmed</p>
                <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                  <Link href="/invoices">View invoice</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
