'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BellRing, Plus } from 'lucide-react';
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
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { useAdminStore, type InvoiceInput } from '@/store/admin-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice, InvoiceStatus } from '@/types/enterprise';

function emptyForm(clientId: string, clientName: string): InvoiceInput {
  return {
    invoiceNumber: `INV-${Math.floor(30000 + Math.random() * 9000)}`,
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
}: {
  items: Invoice[];
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void;
}) {
  if (items.length === 0)
    return <p className="text-muted-foreground py-8 text-center text-sm">No invoices here.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
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
                <Select
                  value={invoice.status}
                  onValueChange={(value) => onStatusChange(invoice, value as InvoiceStatus)}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partial paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminInvoicesPage() {
  const invoices = useAdminStore((state) => state.invoices);
  const clients = useAdminStore((state) => state.clients);
  const addInvoice = useAdminStore((state) => state.addInvoice);
  const updateInvoiceStatus = useAdminStore((state) => state.updateInvoiceStatus);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InvoiceInput>(() =>
    emptyForm(clients[0]?.id ?? '', clients[0]?.companyName ?? ''),
  );

  const receivables = invoices.filter((i) => i.type === 'receivable');
  const payables = invoices.filter((i) => i.type === 'payable');
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const outstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  function handleCreate() {
    if (!form.clientId || form.amount <= 0) return;
    addInvoice(form);
    setOpen(false);
  }

  function handleStatusChange(invoice: Invoice, status: InvoiceStatus) {
    updateInvoiceStatus(invoice.id, status, status === 'paid' ? invoice.amount : undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Generate invoices and track payment status across all clients.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/invoices/alerts">
              <BellRing className="h-4 w-4" /> Alert settings
            </Link>
          </Button>
          <Button onClick={() => setOpen(true)}>
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
              <InvoiceTable items={receivables} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="payables">
              <InvoiceTable items={payables} onStatusChange={handleStatusChange} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Generate invoice"
        description="Creates a draft invoice linked to a client."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Generate invoice</Button>
          </>
        }
      >
        <div className="space-y-4">
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
