'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, MapPin, Navigation, Phone, Truck, XCircle } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeliveryStatusBadge } from '@/features/delivery/delivery-status-badge';
import { DeliveryChallanModal } from '@/features/delivery/delivery-challan-modal';
import { saveChallanPdf } from '@/features/delivery/download-challan-pdf-button';
import { useDeliveryStore } from '@/store/delivery-store';
import { useDeliveryJobs, useRecordDeliveryAttempt } from '@/services/queries';
import type { DeliveryJob } from '@/types/enterprise';

export default function DeliveryPage() {
  const mockJobs = useDeliveryStore((state) => state.jobs);
  const markDelivered = useDeliveryStore((state) => state.markDelivered);
  const liveJobs = useDeliveryJobs();
  const recordAttempt = useRecordDeliveryAttempt();
  const [challanJob, setChallanJob] = useState<DeliveryJob | null>(null);
  const [failReason, setFailReason] = useState<Record<string, string>>({});

  const deliveryJobs = liveJobs.data?.length ? liveJobs.data : mockJobs;
  const delayed = deliveryJobs.filter(
    (d) => d.status === 'delayed' || d.status === 'failed',
  ).length;
  const inTransit = deliveryJobs.filter(
    (d) =>
      d.status === 'dispatched' || d.status === 'out-for-delivery' || d.status === 'processing',
  ).length;
  const delivered = deliveryJobs.filter((d) => d.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Delivery management</h2>
        <p className="text-muted-foreground">
          Track parcels, record up to 3 delivery attempts, and save each challan as a PDF form.
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
          label="Delivered"
          value={delivered.toString()}
          icon={CheckCircle2}
          iconTone="success"
        />
        <KpiCard
          label="Delayed / failed"
          value={delayed.toString()}
          icon={Navigation}
          iconTone="destructive"
        />
        <KpiCard label="Max attempts" value="3" icon={CheckCircle2} iconTone="primary" />
      </div>

      <div className="space-y-4">
        {deliveryJobs.map((job) => {
          const attempts = job.attempts?.length ?? 0;
          const canAttempt =
            job.status !== 'delivered' &&
            job.status !== 'failed' &&
            attempts < (job.maxAttempts ?? 3);
          return (
            <Card key={job.id}>
              <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{job.orderNumber}</p>
                    <DeliveryStatusBadge status={job.status} />
                    {job.trackingNumber ? (
                      <span className="font-mono text-xs">{job.trackingNumber}</span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm">{job.customer}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Attempt {attempts} of {job.maxAttempts ?? 3} · {job.eta}
                  </p>
                  <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5" /> {job.origin}
                    <span className="mx-1">→</span>
                    {job.destination}
                  </div>
                  <div className="mt-3 max-w-md">
                    <Progress value={job.progress} className="h-1.5" />
                  </div>
                  {job.attempts?.length ? (
                    <ul className="mt-3 space-y-1 text-xs">
                      {job.attempts.map((attempt) => (
                        <li key={attempt.attemptNumber}>
                          Attempt {attempt.attemptNumber}: {attempt.outcome}
                          {attempt.reason ? ` — ${attempt.reason}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setChallanJob(job);
                        void saveChallanPdf(job.orderNumber);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" /> Delivery challan
                    </Button>
                    {canAttempt ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            liveJobs.data?.length
                              ? recordAttempt.mutate({ jobId: job.id, outcome: 'success' })
                              : markDelivered(job.id, 'admin')
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Attempt succeeded
                        </Button>
                        <Input
                          placeholder="Fail reason"
                          className="h-9 w-48"
                          value={failReason[job.id] ?? ''}
                          onChange={(event) =>
                            setFailReason((current) => ({
                              ...current,
                              [job.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            recordAttempt.mutate({
                              jobId: job.id,
                              outcome: 'failed',
                              reason: failReason[job.id] || 'Customer not available',
                            })
                          }
                          disabled={!liveJobs.data?.length}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Attempt failed
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:w-64 lg:border-l lg:pl-6">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Driver
                  </p>
                  <p className="text-sm font-medium">{job.driver}</p>
                  <p className="text-muted-foreground text-xs">{job.vehicle}</p>
                  <Button size="sm" variant="outline">
                    <Phone className="h-3.5 w-3.5" /> Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeliveryChallanModal
        job={challanJob}
        open={challanJob !== null}
        onOpenChange={(open) => !open && setChallanJob(null)}
      />
    </div>
  );
}
