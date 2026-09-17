'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Plus,
  X,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { DownloadInvoicePdfButton } from '@/features/finance/download-invoice-pdf-button';
import {
  useClients,
  useCreateInvoice,
  useInvoiceAlertLog,
  useInvoiceAlertRules,
  useInvoices,
  useToggleInvoiceAlertRule,
  useUpdateInvoice,
} from '@/services/queries';
import { invoicesService } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { saveBlobFile } from '@/lib/save-blob';
import type { Invoice, InvoiceStatus } from '@/types/enterprise';
import type { InvoiceAlertChannel } from '@/types/admin';

const channelIcons: Record<InvoiceAlertChannel, typeof Mail> = {
  dashboard: MonitorSmartphone,
  email: Mail,
  sms: MessageSquare,
};

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
  pending,
}: {
  items: Invoice[];
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void;
  pending: boolean;
}) {
  if (items.length === 0)
    return <p className="text-muted-foreground py-8 text-center text-sm">No invoices here.</p>;
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {items.map((invoice) => (
          <div key={invoice.id} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{invoice.invoiceNumber}</p>
                <p className="text-muted-foreground truncate text-sm">
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
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Due {formatDate(invoice.dueDate)}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
            <div className="flex flex-col gap-2">
              <DownloadInvoicePdfButton
                invoiceId={invoice.id}
                invoiceNumber={invoice.invoiceNumber}
                variant="outline"
              />
              <Select
                value={invoice.status}
                disabled={pending}
                onValueChange={(value) => onStatusChange(invoice, value as InvoiceStatus)}
              >
                <SelectTrigger className="h-9 w-full text-xs">
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
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
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
                    <DownloadInvoicePdfButton
                      invoiceId={invoice.id}
                      invoiceNumber={invoice.invoiceNumber}
                    />
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
    </>
  );
}

function AlertSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: rules = [], isLoading } = useInvoiceAlertRules();
  const { data: logs = [] } = useInvoiceAlertLog();
  const toggleRule = useToggleInvoiceAlertRule();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invoice alert settings"
      description="Automated reminders sent to clients and admins as invoices approach their due date."
      className="max-w-2xl"
    >
      {isLoading ? (
        <Loader label="Loading alert rules..." />
      ) : (
        <div className="space-y-6">
          {rules.length === 0 ? (
            <EmptyState
              title="No alert rules"
              description="Seed invoice alert rules to manage reminders here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rules.map((rule) => (
                <div key={rule.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{rule.label}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{rule.description}</p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      disabled={toggleRule.isPending}
                      onCheckedChange={(enabled) => toggleRule.mutate({ id: rule.id, enabled })}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rule.channels.map((channel) => {
                      const Icon = channelIcons[channel];
                      return (
                        <Badge key={channel} variant="secondary" className="gap-1 capitalize">
                          <Icon className="h-3 w-3" /> {channel}
                        </Badge>
                      );
                    })}
                    {rule.recipients.map((recipient) => (
                      <Badge key={recipient} variant="outline" className="capitalize">
                        {recipient}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4" /> Recent alert activity
            </p>
            {logs.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">No alerts sent yet.</p>
            ) : (
              <div className="max-h-64 overflow-auto rounded-lg border">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-muted-foreground bg-muted/40 sticky top-0 text-left text-xs tracking-wide uppercase">
                    <tr className="border-b">
                      <th className="px-3 py-2 font-medium">Invoice</th>
                      <th className="px-3 py-2 font-medium">Client</th>
                      <th className="px-3 py-2 font-medium">Timing</th>
                      <th className="px-3 py-2 font-medium">Channel</th>
                      <th className="px-3 py-2 font-medium">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{log.invoiceNumber}</td>
                        <td className="text-muted-foreground px-3 py-2">{log.clientName}</td>
                        <td className="text-muted-foreground px-3 py-2 capitalize">
                          {log.timing.replace('-', ' ')}
                        </td>
                        <td className="text-muted-foreground px-3 py-2 capitalize">
                          {log.channel}
                        </td>
                        <td className="text-muted-foreground px-3 py-2">
                          {formatDate(log.sentAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function OverdueInvoicesPopup({ overdue, onManage }: { overdue: Invoice[]; onManage: () => void }) {
  const [dismissed, setDismissed] = useState(false);

  const totalOverdue = useMemo(
    () => overdue.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0),
    [overdue],
  );

  if (dismissed || overdue.length === 0) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="animate-slide-up bg-card relative w-full max-w-sm rounded-2xl p-6 pt-10 text-center shadow-2xl">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="bg-destructive absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg">
          <AlertCircle className="h-6 w-6" />
        </span>

        <p className="text-lg font-semibold">
          {overdue.length} invoice{overdue.length === 1 ? '' : 's'} overdue!
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {formatCurrency(totalOverdue)} outstanding needs your attention
        </p>

        <ul className="mt-4 space-y-1.5 text-left text-sm">
          {overdue.slice(0, 3).map((invoice) => (
            <li key={invoice.id} className="text-muted-foreground flex flex-wrap gap-x-1.5">
              <span className="text-foreground font-medium">{invoice.invoiceNumber}</span>
              <span>· {invoice.vendorOrCustomer}</span>
              <span className="text-destructive font-medium">
                · {formatCurrency(invoice.amount - invoice.amountPaid)}
              </span>
            </li>
          ))}
          {overdue.length > 3 ? (
            <li className="text-muted-foreground text-xs">
              +{overdue.length - 3} more invoice{overdue.length - 3 === 1 ? '' : 's'}
            </li>
          ) : null}
        </ul>

        <Button
          className="mt-5 w-full rounded-full"
          onClick={() => {
            setDismissed(true);
            onManage();
          }}
        >
          Open
        </Button>
      </div>
    </div>
  );
}

export default function AdminInvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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

  if (isLoading) {
    return <Loader label="Loading invoices..." />;
  }

  return (
    <div className="space-y-6">
      <OverdueInvoicesPopup overdue={overdue} onManage={() => setAlertsOpen(true)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Generate fillable PDF invoices, mark bank / online transfers as paid, and post to the
            general ledger.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setAlertsOpen(true)}
          >
            <BellRing className="h-4 w-4" /> Alert settings
          </Button>
          <Button
            className="w-full sm:w-auto"
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
        <div className="border-destructive/20 bg-destructive/5 flex items-center gap-3 rounded-full border py-2.5 pr-2.5 pl-3">
          <span className="bg-destructive/15 text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="text-destructive font-semibold">
              {overdue.length} invoice{overdue.length === 1 ? '' : 's'} overdue
            </span>{' '}
            <span className="text-muted-foreground">
              totaling{' '}
              {formatCurrency(overdue.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0))}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive shrink-0 hover:bg-transparent"
            onClick={() => setAlertsOpen(true)}
          >
            Manage alerts
          </Button>
        </div>
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
                pending={updateInvoice.isPending}
              />
            </TabsContent>
            <TabsContent value="payables">
              <InvoiceTable
                items={payables}
                onStatusChange={handleStatusChange}
                pending={updateInvoice.isPending}
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

      <AlertSettingsModal open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
}
