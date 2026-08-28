import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/catalog';

const statusConfig: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  processing: { label: 'Processing', variant: 'warning' },
  packed: { label: 'Packed', variant: 'info' },
  shipped: { label: 'Shipped', variant: 'info' },
  'out-for-delivery': { label: 'Out for delivery', variant: 'brand' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
