import { Bike, CheckCircle2, Clock, Package, Warehouse } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types/catalog';

const STAGES = [
  { key: 'confirmed', label: 'Order placed', match: ['confirmed', 'pending'] as const },
  { key: 'packed', label: 'Packed / warehouse', match: ['processing', 'packed'] as const },
  { key: 'dispatched', label: 'Dispatched', match: ['shipped'] as const },
  { key: 'rider', label: 'With rider', match: ['out-for-delivery'] as const },
  { key: 'delivered', label: 'Delivered', match: ['delivered'] as const },
] as const;

function stageDone(order: Order, match: readonly string[]) {
  return order.timeline.some((step) => match.includes(step.status) && step.timestamp);
}

function stageTime(order: Order, match: readonly string[]) {
  return order.timeline.find((step) => match.includes(step.status) && step.timestamp)?.timestamp;
}

export function OrderJourney({ order }: { order: Order }) {
  const currentIndex = STAGES.reduce((last, stage, index) => {
    const match = stage.match as readonly string[];
    if (stageDone(order, match) || match.includes(order.status)) return index;
    return last;
  }, 0);

  return (
    <div className="mb-5 rounded-xl border p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Delivery status</p>
          <p className="text-muted-foreground text-xs">Track dispatch, rider, and arrival time</p>
        </div>
        <p className="text-primary text-sm font-semibold">
          <Clock className="mr-1 inline h-3.5 w-3.5" />
          ETA: {order.delivery?.eta ?? order.eta}
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-5">
        {STAGES.map((stage, index) => {
          const done = stageDone(order, stage.match) || index < currentIndex;
          const current = index === currentIndex && order.status !== 'cancelled';
          const time = stageTime(order, stage.match);
          const Icon =
            stage.key === 'confirmed'
              ? Package
              : stage.key === 'packed'
                ? Warehouse
                : stage.key === 'dispatched'
                  ? Package
                  : stage.key === 'rider'
                    ? Bike
                    : CheckCircle2;
          return (
            <li
              key={stage.key}
              className={cn(
                'rounded-lg border px-2 py-2 text-center text-xs',
                done || current ? 'border-primary/40 bg-primary/5' : 'border-border',
              )}
            >
              <Icon
                className={cn(
                  'mx-auto mb-1 h-4 w-4',
                  done || current ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <p className="font-medium">{stage.label}</p>
              <p className="text-muted-foreground mt-0.5">
                {time ? formatDateTime(time) : current ? 'In progress' : 'Pending'}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
