import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Invoice } from '@/types/enterprise';

const config: Record<Invoice['status'], { label: string; variant: BadgeProps['variant'] }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partially paid', variant: 'info' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  credit: { label: 'Net-30 credit', variant: 'brand' },
};

export function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
