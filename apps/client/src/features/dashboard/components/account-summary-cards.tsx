import { CreditCard, FileWarning, Bell, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export async function AccountSummaryCards() {
  const session = await getCustomerSession();
  if (!session) return null;

  const client = await prisma.client.findUnique({ where: { userId: session.sub } });
  const [orderCount, invoices, unread] = await Promise.all([
    prisma.order.count({ where: { userId: session.sub } }),
    client ? prisma.invoice.findMany({ where: { clientId: client.id } }) : Promise.resolve([]),
    client
      ? prisma.appNotification.count({ where: { clientId: client.id, read: false } })
      : Promise.resolve(0),
  ]);

  const outstanding = invoices
    .filter((invoice) => invoice.status !== 'PAID')
    .reduce((sum, invoice) => sum + (invoice.amount - invoice.amountPaid), 0);
  const unpaidCount = invoices.filter((invoice) => invoice.status !== 'PAID').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My orders</CardTitle>
          <ShoppingBag className="text-primary h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orderCount}</div>
          <p className="text-muted-foreground text-xs">Track dispatch, rider, and delivery time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          <CreditCard className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoices.length}</div>
          <p className="text-muted-foreground text-xs">Generated when you place an order</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
          <FileWarning className="text-warning h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(outstanding)}</div>
          <p className="text-muted-foreground text-xs">{unpaidCount} invoice(s) open</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          <Bell className="text-info h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unread}</div>
          <p className="text-muted-foreground text-xs">Invoice, payment, and delivery alerts</p>
        </CardContent>
      </Card>
    </div>
  );
}
