'use client';

import { Banknote, Check } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { usePayments, useUpdatePayment } from '@/services/queries';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const { data: payments = [], isLoading } = usePayments();
  const updatePayment = useUpdatePayment();

  const awaiting = payments.filter((payment) => payment.status !== 'confirmed');
  const bankTotal = payments
    .filter((payment) => payment.method === 'bank-account' && payment.status === 'confirmed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const onlineTotal = payments
    .filter((payment) => payment.method === 'online-transfer' && payment.status === 'confirmed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (isLoading) {
    return <Loader label="Loading payments..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Payments received</h2>
        <p className="text-muted-foreground">
          Confirm bank transfers and online transfers from checkout. Confirmed payments settle
          matching invoices and post to cash / bank in the ledger.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Awaiting confirmation"
          value={awaiting.length.toString()}
          icon={Banknote}
          iconTone="warning"
        />
        <KpiCard
          label="Confirmed bank transfer"
          value={formatCurrency(bankTotal)}
          icon={Banknote}
          iconTone="primary"
        />
        <KpiCard
          label="Confirmed online transfer"
          value={formatCurrency(onlineTotal)}
          icon={Banknote}
          iconTone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer inbox ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              title="No transfers yet"
              description="Customer checkout payments via bank or online transfer will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Order</th>
                    <th className="py-2.5 pr-4 font-medium">Customer</th>
                    <th className="py-2.5 pr-4 font-medium">Method</th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 pr-4 font-medium">Reference</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{payment.orderNumber}</td>
                      <td className="text-muted-foreground py-3 pr-4">
                        <p>{payment.customerName}</p>
                        <p className="text-xs">{payment.customerEmail}</p>
                      </td>
                      <td className="py-3 pr-4">{payment.methodLabel}</td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="text-muted-foreground py-3 pr-4">
                        <p>{payment.reference}</p>
                        {payment.transferReference ? (
                          <p className="text-xs">{payment.transferReference}</p>
                        ) : null}
                        {payment.bankName ? (
                          <p className="text-xs">
                            {payment.bankName}
                            {payment.accountTitle ? ` · ${payment.accountTitle}` : ''}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            payment.status === 'confirmed'
                              ? 'success'
                              : payment.status === 'awaiting-transfer'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {payment.status === 'confirmed'
                            ? 'Confirmed'
                            : payment.status === 'awaiting-transfer'
                              ? 'Awaiting transfer'
                              : 'Pending'}
                        </Badge>
                        {payment.paidAt ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDate(payment.paidAt)}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">
                        {payment.status !== 'confirmed' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatePayment.isPending}
                            onClick={() =>
                              updatePayment.mutate({ id: payment.id, status: 'confirmed' })
                            }
                          >
                            <Check className="h-3.5 w-3.5" /> Confirm received
                          </Button>
                        ) : null}
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
