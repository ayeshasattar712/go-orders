'use client';

import { AlertTriangle, CalendarClock, Lock, ShieldCheck, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentClient } from '@/hooks/use-current-client';
import { useAdminStore } from '@/store/admin-store';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CreditPage() {
  const client = useCurrentClient();
  const invoices = useAdminStore((state) => state.invoices).filter(
    (i) => i.clientId === client?.id,
  );

  if (!client) {
    return (
      <EmptyState
        title="No credit account found"
        description="Your account isn't linked to a GoOrder credit line yet. Contact GoOrder Admin to get set up."
      />
    );
  }

  const available = Math.max(0, client.creditLimit - client.creditUsed);
  const utilization =
    client.creditLimit > 0 ? Math.round((client.creditUsed / client.creditLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Credit management</h2>
          <p className="text-muted-foreground">Your Net terms credit line with GoOrder.</p>
        </div>
        {client.creditFrozen ? (
          <Badge variant="destructive" className="gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Account frozen
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Account active
          </Badge>
        )}
      </div>

      {client.creditFrozen ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6 text-sm">
            <AlertTriangle className="text-destructive h-5 w-5 shrink-0" />
            <p>
              Your credit account is currently frozen due to an overdue balance. New credit
              purchases are disabled until the outstanding amount is settled. Message GoOrder Admin
              from the{' '}
              <a href="/chat" className="text-destructive font-medium underline">
                chat
              </a>{' '}
              if you need to discuss a payment plan.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Credit limit"
          value={formatCurrency(client.creditLimit)}
          icon={Wallet}
          iconTone="primary"
        />
        <KpiCard
          label="Available credit"
          value={formatCurrency(available)}
          icon={ShieldCheck}
          iconTone="success"
        />
        <KpiCard
          label="Used credit"
          value={formatCurrency(client.creditUsed)}
          icon={Wallet}
          iconTone="info"
        />
        <KpiCard
          label="Due amount"
          value={formatCurrency(client.dueAmount)}
          icon={CalendarClock}
          iconTone={client.dueAmount > 0 ? 'warning' : 'success'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(client.creditUsed)} used of {formatCurrency(client.creditLimit)}
              </span>
              <span className="font-medium">{utilization}%</span>
            </div>
            <Progress
              value={utilization}
              indicatorClassName={
                utilization > 85 ? 'bg-destructive' : utilization > 60 ? 'bg-warning' : undefined
              }
            />
          </div>
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs">Outstanding balance</p>
              <p className="text-lg font-semibold">{formatCurrency(client.outstandingBalance)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Next due date</p>
              <p className="text-lg font-semibold">
                {client.nextDueDate ? formatDate(client.nextDueDate) : 'No amount due'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total lifetime spend</p>
              <p className="text-lg font-semibold">{formatCurrency(client.totalSpend)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              title="No invoices"
              description="Invoices linked to your credit line will appear here."
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3 pr-4">{formatCurrency(invoice.amount)}</td>
                      <td className="text-muted-foreground py-3 pr-4 capitalize">
                        {invoice.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
