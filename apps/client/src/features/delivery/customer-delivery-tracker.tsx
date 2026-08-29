'use client';

import { CheckCircle2, Clock, MapPin, PackageCheck, Truck, XCircle } from 'lucide-react';
import { DeliveryStatusBadge } from '@/features/delivery/delivery-status-badge';
import { DownloadChallanPdfButton } from '@/features/delivery/download-challan-pdf-button';
import type { DeliveryStatus } from '@/types/enterprise';
import type { Order } from '@/types/catalog';
import { formatDateTime } from '@/lib/utils';

export function CustomerDeliveryTracker({
  order,
  fallbackEta,
}: {
  order: Order;
  fallbackEta: string;
}) {
  const delivery = order.delivery;
  const attempts = delivery?.attempts ?? [];
  const maxAttempts = delivery?.maxAttempts ?? 3;
  const status = (delivery?.status ?? 'processing') as DeliveryStatus;

  return (
    <div className="from-primary/8 to-accent-brand/10 mb-5 space-y-4 rounded-2xl border bg-gradient-to-br p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="text-primary h-4 w-4" />
          <span className="font-semibold">{delivery?.eta ?? fallbackEta}</span>
          <DeliveryStatusBadge status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-xs">{order.trackingNumber}</p>
          <DownloadChallanPdfButton orderNumber={order.orderNumber} />
        </div>
      </div>
      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <MapPin className="h-3.5 w-3.5" />
        {delivery?.destination ?? 'Address on file'}
      </p>
      <p className="text-sm font-medium">
        Delivery attempts: {attempts.length} / {maxAttempts}
      </p>
      <ol className="space-y-2">
        {[1, 2, 3].map((slot) => {
          const attempt = attempts.find((item) => item.attemptNumber === slot);
          return (
            <li
              key={slot}
              className="bg-background/80 flex items-start gap-3 rounded-xl border px-3 py-2 text-sm"
            >
              {attempt?.outcome === 'success' ? (
                <PackageCheck className="text-success mt-0.5 h-4 w-4" />
              ) : attempt?.outcome === 'failed' ? (
                <XCircle className="text-destructive mt-0.5 h-4 w-4" />
              ) : (
                <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
              )}
              <div>
                <p className="font-medium">Attempt {slot}</p>
                {attempt ? (
                  <p className="text-muted-foreground text-xs">
                    {attempt.outcome === 'success' ? 'Delivered successfully' : 'Not delivered'} ·{' '}
                    {formatDateTime(attempt.attemptedAt)}
                    {attempt.reason ? ` · ${attempt.reason}` : ''}
                    {attempt.nextAttemptAt
                      ? ` · Next try ${formatDateTime(attempt.nextAttemptAt)}`
                      : ''}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">Waiting for the rider</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {status === 'delivered' ? (
        <p className="text-success flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" /> Parcel received. Thank you for shopping GoOrder.
        </p>
      ) : null}
      {status === 'failed' ? (
        <p className="text-destructive text-sm font-medium">
          All 3 attempts failed. Contact support with tracking {order.trackingNumber}.
        </p>
      ) : null}
    </div>
  );
}
