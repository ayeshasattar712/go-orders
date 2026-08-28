'use client';

import { useMemo } from 'react';
import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentClient } from '@/hooks/use-current-client';
import { getQuotationsByClient } from '@/lib/mock-data/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Quotation, QuotationStatus } from '@/types/admin';

const statusConfig: Record<
  QuotationStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' }
> = {
  approved: { label: 'Approved', variant: 'success' },
  requested: { label: 'Requested', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

function QuotationList({ items }: { items: Quotation[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No quotations here"
        description="Requested quotations will appear in this tab."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((quotation) => (
        <div
          key={quotation.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{quotation.productName}</p>
              <Badge variant={statusConfig[quotation.status].variant}>
                {statusConfig[quotation.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {quotation.quotationNumber} · {quotation.quantity} {quotation.unit} · from{' '}
              {quotation.vendorName}
            </p>
            <p className="text-muted-foreground text-xs">
              Requested {formatDate(quotation.requestedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(quotation.estimatedTotal)}</p>
            <p className="text-muted-foreground text-xs">Estimated total</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuotationsPage() {
  const client = useCurrentClient();
  const quotations = useMemo(() => (client ? getQuotationsByClient(client.id) : []), [client]);

  const requested = quotations.filter((q) => q.status === 'requested');
  const approved = quotations.filter((q) => q.status === 'approved');
  const rejected = quotations.filter((q) => q.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quotations</h2>
        <p className="text-muted-foreground">
          Track bulk pricing requests you&apos;ve sent to vendors.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Requested"
          value={requested.length.toString()}
          icon={Clock}
          iconTone="warning"
        />
        <KpiCard
          label="Approved"
          value={approved.length.toString()}
          icon={CheckCircle2}
          iconTone="success"
        />
        <KpiCard
          label="Rejected"
          value={rejected.length.toString()}
          icon={XCircle}
          iconTone="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> All quotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({quotations.length})</TabsTrigger>
              <TabsTrigger value="requested">Requested ({requested.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <QuotationList items={quotations} />
            </TabsContent>
            <TabsContent value="requested">
              <QuotationList items={requested} />
            </TabsContent>
            <TabsContent value="approved">
              <QuotationList items={approved} />
            </TabsContent>
            <TabsContent value="rejected">
              <QuotationList items={rejected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
