'use client';

import { Printer } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { DeliveryJob } from '@/types/enterprise';

export function DeliveryChallanModal({
  job,
  open,
  onOpenChange,
}: {
  job: DeliveryJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!job) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delivery challan"
      description="Printable proof-of-dispatch document for this shipment."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / Download
          </Button>
        </>
      }
    >
      <div className="space-y-4 rounded-xl border p-5 text-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <p className="text-lg font-bold">GoOrder</p>
            <p className="text-muted-foreground text-xs">Delivery Challan</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground font-mono text-xs">
              Challan #{job.id.toUpperCase()}
            </p>
            <p className="text-muted-foreground text-xs">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Order
            </p>
            <p className="font-medium">{job.orderNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Customer
            </p>
            <p className="font-medium">{job.customer}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Origin
            </p>
            <p>{job.origin}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Destination
            </p>
            <p>{job.destination}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Driver
            </p>
            <p>{job.driver}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Vehicle
            </p>
            <p>{job.vehicle}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Status
            </p>
            <p className="capitalize">{job.status.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              ETA / Delivered
            </p>
            <p>{job.eta}</p>
          </div>
        </div>
        <p className="text-muted-foreground border-t pt-3 text-xs">
          This challan confirms dispatch of goods for the above order. Please retain for warehouse
          and delivery reconciliation records.
        </p>
      </div>
    </Modal>
  );
}
