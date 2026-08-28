import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { InventoryItem } from '@/types/enterprise';

const config: Record<InventoryItem['status'], { label: string; variant: BadgeProps['variant'] }> = {
  healthy: { label: 'Healthy', variant: 'success' },
  low: { label: 'Low stock', variant: 'warning' },
  critical: { label: 'Critical', variant: 'destructive' },
  overstock: { label: 'Overstock', variant: 'info' },
};

export function StockStatusBadge({ status }: { status: InventoryItem['status'] }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
