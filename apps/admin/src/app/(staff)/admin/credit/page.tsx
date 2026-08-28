'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, Unlock, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { useClients, useInvoices, useUpdateClient } from '@/services/queries';
import { formatCurrency } from '@/lib/utils';
import type { Client } from '@/types/admin';

type PaymentRisk = 'low' | 'medium' | 'high';

const riskConfig: Record<PaymentRisk, { label: string; variant: BadgeProps['variant'] }> = {
  low: { label: 'Low risk', variant: 'success' },
  medium: { label: 'Medium risk', variant: 'warning' },
  high: { label: 'High risk', variant: 'destructive' },
};

function getPaymentRisk(client: Client, hasOverdueInvoice: boolean): PaymentRisk {
  if (client.creditFrozen || hasOverdueInvoice) return 'high';
  const utilization = client.creditLimit > 0 ? (client.creditUsed / client.creditLimit) * 100 : 0;
  if (utilization > 75 || client.dueAmount > 0) return 'medium';
  return 'low';
}

export default function AdminCreditPage() {
  const { data: clients = [], isLoading } = useClients();
  const { data: invoices = [] } = useInvoices();
  const updateClient = useUpdateClient();
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const totalLimit = clients.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalUsed = clients.reduce((sum, c) => sum + c.creditUsed, 0);
  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalDue = clients.reduce((sum, c) => sum + c.dueAmount, 0);
  const frozenCount = clients.filter((c) => c.creditFrozen).length;
  const highRiskCount = clients.filter((client) => {
    const hasOverdue = invoices.some(
      (invoice) => invoice.clientId === client.id && invoice.status === 'overdue',
    );
    return getPaymentRisk(client, hasOverdue) === 'high';
  }).length;

  if (isLoading) {
    return <Loader label="Loading credit accounts..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Credit management</h2>
        <p className="text-muted-foreground">
          Set limits, review utilization, and freeze accounts across all clients.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total credit issued"
          value={formatCurrency(totalLimit)}
          icon={Wallet}
          iconTone="primary"
        />
        <KpiCard
          label="Total used"
          value={formatCurrency(totalUsed)}
          icon={Wallet}
          iconTone="info"
        />
        <KpiCard
          label="Outstanding balances"
          value={formatCurrency(totalOutstanding)}
          icon={AlertTriangle}
          iconTone="warning"
        />
        <KpiCard
          label="Due payments"
          value={formatCurrency(totalDue)}
          icon={AlertTriangle}
          iconTone="warning"
        />
        <KpiCard
          label="Frozen accounts"
          value={frozenCount.toString()}
          icon={Lock}
          iconTone="destructive"
        />
      </div>

      {highRiskCount > 0 ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6 text-sm">
            <ShieldAlert className="text-destructive h-5 w-5 shrink-0" />
            <p>
              <span className="text-destructive font-medium">
                {highRiskCount} client(s) flagged as high payment risk
              </span>{' '}
              — frozen accounts or overdue balances. Review before extending further credit.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Client credit accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.map((client) => {
            const utilization =
              client.creditLimit > 0
                ? Math.round((client.creditUsed / client.creditLimit) * 100)
                : 0;
            const hasOverdue = invoices.some(
              (invoice) => invoice.clientId === client.id && invoice.status === 'overdue',
            );
            const risk = getPaymentRisk(client, hasOverdue);
            return (
              <div key={client.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="hover:text-primary font-medium hover:underline"
                    >
                      {client.companyName}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      Due {formatCurrency(client.dueAmount)} · Outstanding{' '}
                      {formatCurrency(client.outstandingBalance)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={riskConfig[risk].variant}>{riskConfig[risk].label}</Badge>
                    {client.creditFrozen ? (
                      <Badge variant="destructive">Frozen</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-muted-foreground mb-1.5 flex justify-between text-xs">
                    <span>
                      {formatCurrency(client.creditUsed)} of {formatCurrency(client.creditLimit)}
                    </span>
                    <span>{utilization}%</span>
                  </div>
                  <Progress
                    value={utilization}
                    indicatorClassName={utilization > 85 ? 'bg-destructive' : undefined}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-36"
                    placeholder={client.creditLimit.toString()}
                    value={drafts[client.id] ?? ''}
                    onChange={(e) => setDrafts({ ...drafts, [client.id]: Number(e.target.value) })}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateClient.mutate({
                        id: client.id,
                        creditLimit: drafts[client.id] ?? client.creditLimit,
                      })
                    }
                  >
                    Update limit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateClient.mutate({ id: client.id, creditLimit: client.creditLimit + 5000 })
                    }
                  >
                    +$5,000
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateClient.mutate({
                        id: client.id,
                        creditLimit: Math.max(0, client.creditLimit - 5000),
                      })
                    }
                  >
                    -$5,000
                  </Button>
                  {client.creditFrozen ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateClient.mutate({ id: client.id, creditFrozen: false })}
                    >
                      <Unlock className="h-3.5 w-3.5" /> Unfreeze
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateClient.mutate({ id: client.id, creditFrozen: true })}
                    >
                      <Lock className="h-3.5 w-3.5" /> Freeze
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
