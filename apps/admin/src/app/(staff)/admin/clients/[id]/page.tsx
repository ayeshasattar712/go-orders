'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Ban, Lock, Save, ShieldCheck, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { useClients, useInvoices, useLedgerEntries, useUpdateClient } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: clients = [], isLoading } = useClients();
  const { data: invoices = [] } = useInvoices();
  const { data: ledgerEntries = [] } = useLedgerEntries();
  const updateClient = useUpdateClient();

  const client = clients.find((c) => c.id === params.id);
  const clientInvoices = useMemo(
    () => invoices.filter((i) => i.clientId === client?.id),
    [invoices, client?.id],
  );
  const [editedLimit, setEditedLimit] = useState<{ clientId: string; value: number } | null>(null);
  const newLimit =
    editedLimit?.clientId === client?.id ? editedLimit.value : (client?.creditLimit ?? 0);

  const ledger = useMemo(() => {
    const numbers = new Set(clientInvoices.map((invoice) => invoice.invoiceNumber));
    const fromGl = ledgerEntries.filter(
      (entry) =>
        (client && entry.description.includes(client.companyName)) ||
        [...numbers].some((number) => entry.description.includes(number)),
    );
    if (fromGl.length > 0) {
      return fromGl.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return clientInvoices
      .flatMap((invoice) => [
        {
          date: invoice.issueDate,
          description: `Invoice ${invoice.invoiceNumber} issued`,
          debit: invoice.amount,
          credit: 0,
        },
        ...(invoice.amountPaid > 0
          ? [
              {
                date: invoice.dueDate,
                description: `Payment received for ${invoice.invoiceNumber}`,
                debit: 0,
                credit: invoice.amountPaid,
              },
            ]
          : []),
      ])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [client, clientInvoices, ledgerEntries]);

  if (isLoading) {
    return <Loader label="Loading client..." />;
  }

  if (!client) {
    return <EmptyState title="Client not found" description="This client may have been removed." />;
  }

  const utilization =
    client.creditLimit > 0 ? Math.round((client.creditUsed / client.creditLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/admin/clients')}>
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{client.companyName}</h2>
          <p className="text-muted-foreground">
            {client.contactName} · {client.email} · Client since {formatDate(client.joinedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={client.status === 'active' ? 'success' : 'destructive'}>
            {client.status === 'active' ? 'Active' : 'Suspended'}
          </Badge>
          {client.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateClient.mutate({ id: client.id, status: 'suspended' })}
            >
              <Ban className="h-4 w-4" /> Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateClient.mutate({ id: client.id, status: 'active' })}
            >
              <ShieldCheck className="h-4 w-4" /> Reactivate
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Credit limit</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(client.creditLimit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Outstanding balance</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(client.outstandingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total orders</p>
            <p className="mt-1 text-xl font-bold">{client.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Lifetime spend</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(client.totalSpend)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(client.creditUsed)} used of {formatCurrency(client.creditLimit)}
              </span>
              <span className="font-medium">{utilization}%</span>
            </div>
            <Progress
              value={utilization}
              indicatorClassName={utilization > 85 ? 'bg-destructive' : undefined}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>Adjust credit limit</Label>
              <Input
                type="number"
                min={0}
                value={newLimit}
                onChange={(e) => {
                  if (!client) return;
                  setEditedLimit({ clientId: client.id, value: Number(e.target.value) });
                }}
                className="w-40"
              />
            </div>
            <Button
              onClick={() => updateClient.mutate({ id: client.id, creditLimit: newLimit })}
              disabled={updateClient.isPending}
            >
              <Save className="h-4 w-4" /> Update limit
            </Button>
            {client.creditFrozen ? (
              <Button
                variant="outline"
                onClick={() => updateClient.mutate({ id: client.id, creditFrozen: false })}
              >
                <Unlock className="h-4 w-4" /> Unfreeze account
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => updateClient.mutate({ id: client.id, creditFrozen: true })}
              >
                <Lock className="h-4 w-4" /> Freeze account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice & ledger history</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invoices">
            <TabsList>
              <TabsTrigger value="invoices">Invoices ({clientInvoices.length})</TabsTrigger>
              <TabsTrigger value="ledger">Individual ledger</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices">
              {clientInvoices.length === 0 ? (
                <EmptyState
                  title="No invoices"
                  description="No invoices have been issued to this client yet."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                      <tr className="border-b">
                        <th className="py-2.5 pr-4 font-medium">Invoice</th>
                        <th className="py-2.5 pr-4 font-medium">Due</th>
                        <th className="py-2.5 pr-4 font-medium">Amount</th>
                        <th className="py-2.5 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="text-muted-foreground py-3 pr-4">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="py-3 pr-4">{formatCurrency(invoice.amount)}</td>
                          <td className="py-3 pr-4">
                            <InvoiceStatusBadge status={invoice.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="ledger">
              {ledger.length === 0 ? (
                <EmptyState
                  title="No ledger entries"
                  description="Ledger activity will appear as invoices are issued and paid."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                      <tr className="border-b">
                        <th className="py-2.5 pr-4 font-medium">Date</th>
                        <th className="py-2.5 pr-4 font-medium">Description</th>
                        <th className="py-2.5 pr-4 font-medium">Debit</th>
                        <th className="py-2.5 pr-4 font-medium">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((entry, index) => (
                        <tr
                          key={`${entry.description}-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="text-muted-foreground py-3 pr-4">
                            {formatDate(entry.date)}
                          </td>
                          <td className="py-3 pr-4">{entry.description}</td>
                          <td className="py-3 pr-4">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                          </td>
                          <td className="py-3 pr-4">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
