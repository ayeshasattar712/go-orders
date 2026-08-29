'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, ReceiptText, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { invoicesService } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { saveBlobFile } from '@/lib/save-blob';
import type { Invoice } from '@/types/enterprise';

function InvoiceTable({
  items,
  onDownload,
}: {
  items: Invoice[];
  onDownload: (invoice: Invoice) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState title="No invoices here" description="Place an order to generate an invoice." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
          <tr className="border-b">
            <th className="py-2.5 pr-4 font-medium">Invoice</th>
            <th className="py-2.5 pr-4 font-medium">Order</th>
            <th className="py-2.5 pr-4 font-medium">Issued</th>
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
              <td className="py-3 pr-4 font-medium">{formatCurrency(invoice.amount)}</td>
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    void invoicesService
      .list()
      .then(setInvoices)
      .catch(() => setInvoices([]));
  }, []);

  const paid = useMemo(() => invoices.filter((i) => i.status === 'paid'), [invoices]);
  const unpaid = useMemo(
    () =>
      invoices.filter((i) => i.status === 'sent' || i.status === 'partial' || i.status === 'draft'),
    [invoices],
  );
  const outstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  async function handleDownload(invoice: Invoice) {
    const file = await invoicesService.downloadPdf(invoice.id);
    saveBlobFile(file.blob, file.filename);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
        <p className="text-muted-foreground">
          Every purchase generates a fillable PDF invoice you can download and save.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          iconTone="primary"
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
      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid ({unpaid.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InvoiceTable items={invoices} onDownload={handleDownload} />
            </TabsContent>
            <TabsContent value="paid">
              <InvoiceTable items={paid} onDownload={handleDownload} />
            </TabsContent>
            <TabsContent value="unpaid">
              <InvoiceTable items={unpaid} onDownload={handleDownload} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {invoices.length === 0 ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" /> Invoices appear here after you place an order.
        </p>
      ) : null}
    </div>
  );
}
