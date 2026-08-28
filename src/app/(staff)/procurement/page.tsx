import type { Metadata } from 'next';
import { FileText, PlusCircle, Send, Warehouse } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcurementBoard } from '@/features/procurement/components/procurement-board';
import { BidComparisonTable } from '@/features/procurement/components/bid-comparison-table';
import { rfqRequests, quotesByRfq } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Procurement' };

export default function ProcurementPage() {
  const totalValue = rfqRequests.reduce((sum, r) => sum + r.estimatedValue, 0);
  const exampleRfq = rfqRequests.find((r) => r.id === 'rfq_1')!;
  const exampleQuotes = quotesByRfq.rfq_1 ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Procurement</h2>
          <p className="text-muted-foreground">
            From requirement request to warehouse receiving — one visual pipeline.
          </p>
        </div>
        <Button size="lg">
          <PlusCircle className="h-4 w-4" /> New requirement request
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active requests"
          value={String(rfqRequests.length)}
          icon={FileText}
          iconTone="primary"
        />
        <KpiCard
          label="Pipeline value"
          value={formatCurrency(totalValue)}
          icon={Send}
          iconTone="info"
          delta={8.2}
        />
        <KpiCard
          label="Avg. cycle time"
          value="6.4 days"
          delta={-14}
          icon={Warehouse}
          iconTone="success"
        />
        <KpiCard label="Awaiting approval" value="2" icon={FileText} iconTone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procurement pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcurementBoard requests={rfqRequests} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotation comparison — {exampleRfq.title}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {exampleRfq.quantity} units requested by {exampleRfq.requestedBy} (
            {exampleRfq.department})
          </p>
        </CardHeader>
        <CardContent>
          <BidComparisonTable bids={exampleQuotes} />
        </CardContent>
      </Card>
    </div>
  );
}
