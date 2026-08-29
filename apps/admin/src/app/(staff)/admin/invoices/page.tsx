'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BellRing, Download, Plus } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader } from '@/components/ui/loader';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { useClients, useCreateInvoice, useInvoices, useUpdateInvoice } from '@/services/queries';
import { invoicesService } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { saveBlobFile } from '@/lib/save-blob';
import type { Invoice, InvoiceStatus } from '@/types/enterprise';

type InvoiceForm = {
  clientId: string;
  vendorOrCustomer: string;
  type: Invoice['type'];
  issueDate: string;
  dueDate: string;
  amount: number;
  orderNumber?: string;
};

function emptyForm(clientId: string, clientName: string): InvoiceForm {
  return {
    vendorOrCustomer: clientName,
    clientId,
    type: 'receivable',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    amount: 0,
  };
}

function InvoiceTable({
  items,
  onStatusChange,
  onDownload,
  pending,
  downloadingId,
}: {
  items: Invoice[];
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void;
  onDownload: (invoice: Invoice) => void;
  pending: boolean;
  downloadingId: string | null;
}) {
  if (items.length === 0)
    return <p className="text-muted-foreground py-8 text-center text-sm">No invoices here.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-sm">
        <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
          <tr className="border-b">
            <th className="py-2.5 pr-4 font-medium">Invoice</th>
            <th className="py-2.5 pr-4 font-medium">Party</th>
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
              <td className="text-muted-foreground py-3 pr-4">
                {invoice.clientId ? (
                  <Link
                    href={`/admin/clients/${invoice.clientId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {invoice.vendorOrCustomer}
                  </Link>
                ) : (
                  invoice.vendorOrCustomer
                )}
              </td>
              <td className="text-muted-foreground py-3 pr-4">{formatDate(invoice.dueDate)}</td>
              <td className="py-3 pr-4 font-medium">{formatCurrency(invoice.amount)}</td>
              <td className="py-3 pr-4">
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={downloadingId === invoice.id}
                    onClick={() => onDownload(invoice)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloadingId === invoice.id ? 'Saving...' : 'PDF'}
                  </Button>
                  <Select
                    value={invoice.status}
                    disabled={pending}
                    onValueChange={(value) => onStatusChange(invoice, value as InvoiceStatus)}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="partial">Partial paid</SelectItem>
                      <SelectItem value="paid">Paid (bank / online)</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminInvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(() => emptyForm('', ''));

  const receivables = invoices.filter((i) => i.type === 'receivable');
  const payables = invoices.filter((i) => i.type === 'payable');
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const outstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  const defaultClient = useMemo(() => clients[0], [clients]);

  async function handleCreate() {
    if (!form.clientId) {
      setFormError('Select a client.');
      return;
    }
    if (form.amount <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }
    setFormError(null);
    try {
      const invoice = await createInvoice.mutateAsync(form);
      const file = await invoicesService.downloadPdf(invoice.id);
      saveBlobFile(file.blob, file.filename);
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create invoice');
    }
  }

  function handleStatusChange(invoice: Invoice, status: InvoiceStatus) {
    updateInvoice.mutate({
      id: invoice.id,
      status,
      amountPaid: status === 'paid' ? invoice.amount : undefined,
    });
  }

  async function handleDownload(invoice: Invoice) {
    setDownloadingId(invoice.id);
    try {
      const file = await invoicesService.downloadPdf(invoice.id);
      saveBlobFile(file.blob, file.filename);
    } finally {
      setDownloadingId(null);
    }
  }

  if (isLoading) {
    return <Loader label="Loading invoices..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Generate fillable PDF invoices, mark bank / online transfers as paid, and post to the
            general ledger.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/invoices/alerts">
              <BellRing className="h-4 w-4" /> Alert settings
            </Link>
          </Button>
          <Button
            onClick={() => {
              setForm(emptyForm(defaultClient?.id ?? '', defaultClient?.companyName ?? ''));
              setFormError(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Generate invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Outstanding balance"
          value={formatCurrency(outstanding)}
          icon={AlertCircle}
          iconTone="primary"
        />
        <KpiCard
          label="Overdue"
          value={overdue.length.toString()}
          icon={AlertCircle}
          iconTone="destructive"
        />
        <KpiCard
          label="Receivables"
          value={receivables.length.toString()}
          icon={AlertCircle}
          iconTone="info"
        />
        <KpiCard
          label="Payables"
          value={payables.length.toString()}
          icon={AlertCircle}
          iconTone="warning"
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
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="receivables">
            <TabsList>
              <TabsTrigger value="receivables">
                Accounts receivable ({receivables.length})
              </TabsTrigger>
              <TabsTrigger value="payables">Accounts payable ({payables.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="receivables">
              <InvoiceTable
                items={receivables}
                onStatusChange={handleStatusChange}
                onDownload={handleDownload}
                pending={updateInvoice.isPending}
                downloadingId={downloadingId}
              />
            </TabsContent>
            <TabsContent value="payables">
              <InvoiceTable
                items={payables}
                onStatusChange={handleStatusChange}
                onDownload={handleDownload}
                pending={updateInvoice.isPending}
                downloadingId={downloadingId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Generate invoice"
        description="Creates an invoice, notifies the client, posts ledger entries, and saves a PDF."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createInvoice.isPending || !form.clientId || form.amount <= 0}
            >
              {createInvoice.isPending ? 'Generating PDF...' : 'Generate invoice'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError ? (
            <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
              {formError}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={form.clientId}
              onValueChange={(value) => {
                const client = clients.find((c) => c.id === value);
                setForm({ ...form, clientId: value, vendorOrCustomer: client?.companyName ?? '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value as Invoice['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receivable">Receivable (client invoice)</SelectItem>
                <SelectItem value="payable">Payable (vendor bill)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Order number (optional)</Label>
              <Input
                value={form.orderNumber ?? ''}
                onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Issue date</Label>
              <Input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
