'use client';

import { Award, Calendar, Gavel, ListChecks } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { BidComparisonTable } from '@/features/procurement/components/bid-comparison-table';
import { useTenders, useBidsByTender } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusVariant: Record<string, BadgeProps['variant']> = {
  open: 'info',
  evaluating: 'warning',
  awarded: 'success',
  closed: 'secondary',
};

export default function TendersPage() {
  const { data: tenders } = useTenders();
  const bidsByTender = useBidsByTender();
  const currentTenders = tenders?.tenders ?? [];

  const openTenders = currentTenders.filter((t) => t.status === 'open').length;
  const totalBudget = currentTenders.reduce((sum, t) => sum + t.budget, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tender management</h2>
        <p className="text-muted-foreground">
          Manage tender listings, evaluate bids, and award contracts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open tenders" value={openTenders.toString()} icon={Gavel} iconTone="info" />
        <KpiCard
          label="Total tender value"
          value={formatCurrency(totalBudget)}
          icon={ListChecks}
          iconTone="primary"
        />
        <KpiCard label="Awarded this quarter" value="1" icon={Award} iconTone="success" />
        <KpiCard label="Avg. bids per tender" value="5" icon={Calendar} iconTone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tender listings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
              <tr className="border-b">
                <th className="py-2.5 pr-4 font-medium">Tender</th>
                <th className="py-2.5 pr-4 font-medium">Category</th>
                <th className="py-2.5 pr-4 font-medium">Budget</th>
                <th className="py-2.5 pr-4 font-medium">Deadline</th>
                <th className="py-2.5 pr-4 font-medium">Bids</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTenders.map((tender) => (
                <tr key={tender.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{tender.title}</td>
                  <td className="text-muted-foreground py-3 pr-4">{tender.category}</td>
                  <td className="py-3 pr-4">{formatCurrency(tender.budget)}</td>
                  <td className="text-muted-foreground py-3 pr-4">{formatDate(tender.deadline)}</td>
                  <td className="py-3 pr-4">{tender.bidCount}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant[tender.status]}>{tender.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {currentTenders
        .filter((tender) => bidsByTender[tender.id]?.length)
        .map((tender) => (
          <Card key={tender.id}>
            <CardHeader>
              <CardTitle>Bid comparison — {tender.title}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Budget {formatCurrency(tender.budget)} · Deadline {formatDate(tender.deadline)}
              </p>
            </CardHeader>
            <CardContent>
              <BidComparisonTable bids={bidsByTender[tender.id] ?? []} />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
