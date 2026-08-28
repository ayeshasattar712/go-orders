'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryStatusBadge } from '@/features/delivery/delivery-status-badge';
import { DeliveryChallanModal } from '@/features/delivery/delivery-challan-modal';
import { useDeliveryStore } from '@/store/delivery-store';
import { formatDateTime } from '@/lib/utils';

export function CustomerDeliveryTracker({
  orderNumber,
  fallbackEta,
}: {
  orderNumber: string;
  fallbackEta: string;
}) {
  const job = useDeliveryStore((state) => state.getByOrderNumber(orderNumber));
  const markDelivered = useDeliveryStore((state) => state.markDelivered);
  const [showChallan, setShowChallan] = useState(false);

  if (!job) {
    return (
      <div className="bg-primary/5 text-primary mb-5 flex items-center gap-2 rounded-lg p-3 text-sm">
        <MapPin className="h-4 w-4" /> Estimated arrival: {fallbackEta}
      </div>
    );
  }

  const canConfirm = job.status === 'dispatched' || job.status === 'out-for-delivery';

  return (
    <div className="bg-primary/5 mb-5 space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="text-primary h-4 w-4" />
          <span className="font-medium">{job.eta}</span>
          <DeliveryStatusBadge status={job.status} />
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowChallan(true)}>
          <FileText className="h-3.5 w-3.5" /> View challan
        </Button>
      </div>
      {job.status === 'delivered' && job.deliveredAt ? (
        <p className="text-muted-foreground text-xs">
          Marked delivered by {job.deliveredBy === 'admin' ? 'GoOrder operations' : 'you'} on{' '}
          {formatDateTime(job.deliveredAt)}.
        </p>
      ) : null}
      {canConfirm ? (
        <div className="border-primary/10 flex items-center gap-2 border-t pt-3">
          <p className="text-muted-foreground flex-1 text-xs">
            Received your order? Confirm delivery below.
          </p>
          <Button size="sm" onClick={() => markDelivered(job.id, 'customer')}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirm delivery received
          </Button>
        </div>
      ) : null}
      <DeliveryChallanModal job={job} open={showChallan} onOpenChange={setShowChallan} />
    </div>
  );
}
