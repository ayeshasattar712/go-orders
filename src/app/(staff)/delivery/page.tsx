'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, MapPin, Navigation, Phone, Truck } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DeliveryStatusBadge } from '@/features/delivery/delivery-status-badge';
import { DeliveryChallanModal } from '@/features/delivery/delivery-challan-modal';
import { useDeliveryStore } from '@/store/delivery-store';
import type { DeliveryJob } from '@/types/enterprise';

export default function DeliveryPage() {
  const deliveryJobs = useDeliveryStore((state) => state.jobs);
  const markDelivered = useDeliveryStore((state) => state.markDelivered);
  const [challanJob, setChallanJob] = useState<DeliveryJob | null>(null);

  const delayed = deliveryJobs.filter((d) => d.status === 'delayed').length;
  const inTransit = deliveryJobs.filter(
    (d) => d.status === 'dispatched' || d.status === 'out-for-delivery',
  ).length;
  const delivered = deliveryJobs.filter((d) => d.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Delivery management</h2>
        <p className="text-muted-foreground">
          Live tracking, driver assignments, and delivery confirmations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active deliveries"
          value={inTransit.toString()}
          icon={Truck}
          iconTone="info"
        />
        <KpiCard
          label="Delivered today"
          value={delivered.toString()}
          icon={CheckCircle2}
          iconTone="success"
        />
        <KpiCard
          label="Delayed"
          value={delayed.toString()}
          icon={Navigation}
          iconTone="destructive"
        />
        <KpiCard
          label="On-time rate"
          value="98.2%"
          delta={1.3}
          icon={CheckCircle2}
          iconTone="primary"
        />
      </div>

      <div className="space-y-4">
        {deliveryJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{job.orderNumber}</p>
                  <DeliveryStatusBadge status={job.status} />
                  {job.deliveredBy ? (
                    <span className="text-muted-foreground text-xs">
                      · Confirmed by {job.deliveredBy === 'customer' ? 'customer' : 'admin'}
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">{job.customer}</p>

                <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5" /> {job.origin}
                  <span className="mx-1">→</span>
                  {job.destination}
                </div>

                <div className="mt-3 max-w-md">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Route progress</span>
                    <span className="font-medium">{job.progress}%</span>
                  </div>
                  <Progress
                    value={job.progress}
                    className="h-1.5"
                    indicatorClassName={job.status === 'delayed' ? 'bg-destructive' : undefined}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setChallanJob(job)}>
                    <FileText className="h-3.5 w-3.5" /> Delivery challan
                  </Button>
                  {job.status !== 'delivered' ? (
                    <Button size="sm" onClick={() => markDelivered(job.id, 'admin')}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark delivered
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:w-64 lg:border-l lg:pl-6">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Driver
                </p>
                <p className="text-sm font-medium">{job.driver}</p>
                <p className="text-muted-foreground text-xs">{job.vehicle}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={job.driver === 'Unassigned'}>
                    <Phone className="h-3.5 w-3.5" /> Contact
                  </Button>
                  <span className="text-muted-foreground text-xs">{job.eta}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery confirmation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Customer confirmation</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Buyers can confirm receipt from their order tracking page once a shipment is out for
              delivery.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Admin confirmation</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Operations team can mark deliveries complete here after reconciling carrier scan data.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Proof of delivery</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Delivery challans are generated per shipment and stored with the order record.
            </p>
          </div>
        </CardContent>
      </Card>

      <DeliveryChallanModal
        job={challanJob}
        open={challanJob !== null}
        onOpenChange={(open) => !open && setChallanJob(null)}
      />
    </div>
  );
}
