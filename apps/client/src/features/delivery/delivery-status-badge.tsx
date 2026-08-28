import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { DeliveryStatus } from '@/types/enterprise';

const config: Record<DeliveryStatus, { label: string; variant: BadgeProps['variant'] }> = {
  processing: { label: 'Processing', variant: 'secondary' },
  packed: { label: 'Packed', variant: 'info' },
  dispatched: { label: 'Dispatched', variant: 'info' },
  'out-for-delivery': { label: 'Out for delivery', variant: 'brand' },
  delivered: { label: 'Delivered', variant: 'success' },
  delayed: { label: 'Delayed', variant: 'destructive' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
