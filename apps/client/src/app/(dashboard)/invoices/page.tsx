'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { DownloadInvoicePdfButton } from '@/features/finance/download-invoice-pdf-button';
import { invoicesService } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types/enterprise';

function InvoiceTable({ items }: { items: Invoice[] }) {
  if (items.length === 0) {
    return (
      <EmptyState title="No invoices here" description="Place an order to generate an invoice." />
    );
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {items.map((invoice) => (
          <div key={invoice.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{invoice.invoiceNumber}</p>
                <p className="text-muted-foreground text-sm">
                  {invoice.orderNumber ?? 'No order'} · {formatDate(invoice.issueDate)}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
              <DownloadInvoicePdfButton
                invoiceId={invoice.id}
                invoiceNumber={invoice.invoiceNumber}
                variant="outline"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
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
                  <DownloadInvoicePdfButton
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoiceNumber}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
        <p className="text-muted-foreground">
          Every purchase generates a PDF invoice you can view on screen or download.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Amount due"
          value={formatCurrency(outstanding)}
          hint="Balance still left to collect"
          icon={Wallet}
          iconTone="primary"
        />
        <KpiCard
          label="Open invoices"
          value={unpaid.length.toString()}
          hint="Waiting for payment"
          icon={Clock3}
          iconTone="warning"
        />
        <KpiCard
          label="Paid invoices"
          value={paid.length.toString()}
          hint="Fully settled"
          icon={CheckCircle2}
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
              <InvoiceTable items={invoices} />
            </TabsContent>
            <TabsContent value="paid">
              <InvoiceTable items={paid} />
            </TabsContent>
            <TabsContent value="unpaid">
              <InvoiceTable items={unpaid} />
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
