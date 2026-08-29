'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Boxes,
  DollarSign,
  Receipt,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RevenueTrendChart } from '@/components/charts';
import { InvoiceStatusBadge } from '@/features/finance/invoice-status-badge';
import { OrderStatusBadge } from '@/features/orders/order-status-badge';
import { useAdminStore } from '@/store/admin-store';
import { useDeliveryStore } from '@/store/delivery-store';
import { monthlyRevenue, inventoryItems, orders, getBestSellers } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { clients, vendors, invoices } = useAdminStore((state) => state);
  const deliveryJobs = useDeliveryStore((state) => state.jobs);
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const outstandingInvoices = invoices.filter((i) => i.status !== 'paid');
  const outstandingAmount = outstandingInvoices.reduce(
    (sum, i) => sum + (i.amount - i.amountPaid),
    0,
  );
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const totalCreditUsed = clients.reduce((sum, c) => sum + c.creditUsed, 0);
  const totalCreditLimit = clients.reduce((sum, c) => sum + c.creditLimit, 0);
  const creditUtilization =
    totalCreditLimit > 0 ? Math.round((totalCreditUsed / totalCreditLimit) * 100) : 0;
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === 'critical' || item.status === 'low',
  );
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.onHand * item.unitCost, 0);
  const pendingDeliveries = deliveryJobs.filter((job) => job.status !== 'delivered');
  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const topProducts = getBestSellers(5);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
          Overview
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Admin dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Revenue, orders, customers, vendors, credit, and inventory at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue (7 mo)"
          value={formatCurrency(totalRevenue)}
          delta={12.4}
          icon={DollarSign}
          iconTone="primary"
        />
        <KpiCard
          label="Total orders"
          value={orders.length.toString()}
          delta={6.2}
          icon={ShoppingBag}
          iconTone="info"
        />
        <KpiCard
          label="Total customers"
          value={clients.length.toString()}
          icon={Users}
          iconTone="success"
        />
        <KpiCard
          label="Total vendors"
          value={vendors.length.toString()}
          icon={Store}
          iconTone="primary"
        />
        <KpiCard
          label="Outstanding invoices"
          value={formatCurrency(outstandingAmount)}
          icon={Receipt}
          iconTone={overdueInvoices.length > 0 ? 'destructive' : 'warning'}
        />
        <KpiCard
          label="Credit utilization"
          value={`${creditUtilization}%`}
          icon={Wallet}
          iconTone="info"
        />
        <KpiCard
          label="Inventory value"
          value={formatCurrency(inventoryValue)}
          icon={Boxes}
          iconTone="primary"
        />
        <KpiCard
          label="Pending deliveries"
          value={pendingDeliveries.length.toString()}
          icon={Truck}
          iconTone="warning"
        />
      </div>

      {(overdueInvoices.length > 0 || pendingVendors.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {overdueInvoices.length > 0 ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-center gap-3 pt-6 text-sm">
                <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
                <p>
                  <Link href="/admin/invoices" className="text-destructive font-medium underline">
                    {overdueInvoices.length} invoice(s) overdue
                  </Link>{' '}
                  — follow up with clients recommended.
                </p>
              </CardContent>
            </Card>
          ) : null}
          {pendingVendors.length > 0 ? (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="flex items-center gap-3 pt-6 text-sm">
                <AlertCircle className="text-warning h-5 w-5 shrink-0" />
                <p>
                  <Link href="/admin/vendors" className="text-warning font-medium underline">
                    {pendingVendors.length} vendor application(s)
                  </Link>{' '}
                  awaiting review.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart
              data={monthlyRevenue}
              xKey="month"
              series={[
                { key: 'revenue', color: 'hsl(var(--chart-1))', label: 'Revenue' },
                { key: 'profit', color: 'hsl(var(--chart-2))', label: 'Profit' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{product.name}</span>
                <span className="text-muted-foreground shrink-0 font-medium">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground text-xs">
                    {order.vendorName} · {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstandingInvoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-muted-foreground text-xs">
                    {invoice.vendorOrCustomer} · Due {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(invoice.amount - invoice.amountPaid)}
                  </p>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
            ))}
            {outstandingInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No outstanding invoices. Great job!</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low stock products</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              All products are within healthy stock levels.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                  <tr className="border-b">
                    <th className="py-2.5 pr-4 font-medium">Product</th>
                    <th className="py-2.5 pr-4 font-medium">Warehouse</th>
                    <th className="py-2.5 pr-4 font-medium">On hand</th>
                    <th className="py-2.5 pr-4 font-medium">Reorder point</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">{item.sku}</p>
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">{item.warehouse}</td>
                      <td className="py-3 pr-4 font-medium">{item.onHand}</td>
                      <td className="text-muted-foreground py-3 pr-4">{item.reorderPoint}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={item.status === 'critical' ? 'destructive' : 'warning'}>
                          {item.status}
                        </Badge>
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
