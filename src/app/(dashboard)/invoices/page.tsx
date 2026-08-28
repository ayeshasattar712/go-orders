'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Download, ReceiptText, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { useAdminStore } from '@/store/admin-store';
import { useCurrentClient } from '@/hooks/use-current-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types/enterprise';

function InvoiceTable({
  items,
  onDownload,
}: {
  items: Invoice[];
  onDownload: (invoice: Invoice) => void;
}) {
  if (items.length === 0) {
    return <EmptyState title="No invoices here" description="You're all caught up in this view." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
          <tr className="border-b">
            <th className="py-2.5 pr-4 font-medium">Invoice</th>
            <th className="py-2.5 pr-4 font-medium">Order</th>
            <th className="py-2.5 pr-4 font-medium">Issued</th>
            <th className="py-2.5 pr-4 font-medium">Due</th>
            <th className="py-2.5 pr-4 font-medium">Amount</th>
            <th className="py-2.5 pr-4 font-medium">Status</th>
            <th className="py-2.5 pr-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {items.map((invoice) => (
            <tr key={invoice.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{invoice.invoiceNumber}</td>
              <td className="text-muted-foreground py-3 pr-4">{invoice.orderNumber ?? '—'}</td>
              <td className="text-muted-foreground py-3 pr-4">{formatDate(invoice.issueDate)}</td>
              <td className="text-muted-foreground py-3 pr-4">{formatDate(invoice.dueDate)}</td>
              <td className="py-3 pr-4 font-medium">
                {formatCurrency(invoice.amount)}
                {invoice.status === 'partial' ? (
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({formatCurrency(invoice.amountPaid)} paid)
                  </span>
                ) : null}
              </td>
              <td className="py-3 pr-4">
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="py-3 pr-4">
                <Button size="sm" variant="ghost" onClick={() => onDownload(invoice)}>
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CustomerInvoicesPage() {
  const client = useCurrentClient();
  const allInvoices = useAdminStore((state) => state.invoices);
  const [downloading, setDownloading] = useState<string | null>(null);

  const myInvoices = useMemo(
    () => allInvoices.filter((invoice) => invoice.clientId === client?.id),
    [allInvoices, client?.id],
  );

  const paid = myInvoices.filter((i) => i.status === 'paid');
  const unpaid = myInvoices.filter(
    (i) => i.status === 'sent' || i.status === 'partial' || i.status === 'draft',
  );
  const overdue = myInvoices.filter((i) => i.status === 'overdue');
  const outstanding = myInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  function handleDownload(invoice: Invoice) {
    setDownloading(invoice.id);
    const content = `GoOrder Invoice\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.amount)}\nDue date: ${formatDate(invoice.dueDate)}\nStatus: ${invoice.status}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(null), 400);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
        <p className="text-muted-foreground">
          View, track, and download every invoice issued to your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Outstanding balance"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          iconTone="primary"
        />
        <KpiCard
          label="Overdue"
          value={overdue.length.toString()}
          icon={AlertCircle}
          iconTone="destructive"
        />
        <KpiCard
          label="Unpaid"
          value={unpaid.length.toString()}
          icon={ReceiptText}
          iconTone="warning"
        />
        <KpiCard
          label="Paid"
          value={paid.length.toString()}
          icon={ReceiptText}
          iconTone="success"
        />
      </div>

      {overdue.length > 0 ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6 text-sm">
            <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
            <p>
              <span className="text-destructive font-medium">
                {overdue.length} invoice(s) overdue
              </span>{' '}
              totaling{' '}
              {formatCurrency(overdue.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0))}.
              Please settle to avoid credit account restrictions.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({myInvoices.length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid ({unpaid.length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InvoiceTable items={myInvoices} onDownload={handleDownload} />
            </TabsContent>
            <TabsContent value="paid">
              <InvoiceTable items={paid} onDownload={handleDownload} />
            </TabsContent>
            <TabsContent value="unpaid">
              <InvoiceTable items={unpaid} onDownload={handleDownload} />
            </TabsContent>
            <TabsContent value="overdue">
              <InvoiceTable items={overdue} onDownload={handleDownload} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {downloading ? <p className="text-muted-foreground text-xs">Preparing download…</p> : null}
    </div>
  );
}
