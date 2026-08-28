'use client';

import { Package, ShoppingBasket, Truck } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { vendorPurchases } from '@/lib/mock-data/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { VendorPurchase } from '@/types/admin';

const invoiceStatusConfig: Record<
  VendorPurchase['invoiceStatus'],
  { label: string; variant: BadgeProps['variant'] }
> = {
  unbilled: { label: 'Unbilled', variant: 'secondary' },
  billed: { label: 'Billed', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
};

const deliveryStatusConfig: Record<
  VendorPurchase['deliveryStatus'],
  { label: string; variant: BadgeProps['variant'] }
> = {
  ordered: { label: 'Ordered', variant: 'secondary' },
  shipped: { label: 'Shipped', variant: 'info' },
  received: { label: 'Received (GRN)', variant: 'success' },
};

export default function AdminPurchasesPage() {
  const totalCost = vendorPurchases.reduce((sum, p) => sum + p.purchaseCost, 0);
  const unbilled = vendorPurchases.filter((p) => p.invoiceStatus === 'unbilled');
  const inTransit = vendorPurchases.filter((p) => p.deliveryStatus !== 'received');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Vendor purchase tracking</h2>
        <p className="text-muted-foreground">
          Products purchased from vendors for fulfillment and stocking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total purchase cost"
          value={formatCurrency(totalCost)}
          icon={ShoppingBasket}
          iconTone="primary"
        />
        <KpiCard
          label="Awaiting delivery"
          value={inTransit.length.toString()}
          icon={Truck}
          iconTone="info"
        />
        <KpiCard
          label="Unbilled purchases"
          value={unbilled.length.toString()}
          icon={Package}
          iconTone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
                <tr className="border-b">
                  <th className="py-2.5 pr-4 font-medium">Vendor</th>
                  <th className="py-2.5 pr-4 font-medium">Product</th>
                  <th className="py-2.5 pr-4 font-medium">Quantity</th>
                  <th className="py-2.5 pr-4 font-medium">Purchase cost</th>
                  <th className="py-2.5 pr-4 font-medium">Ordered date</th>
                  <th className="py-2.5 pr-4 font-medium">Expected delivery</th>
                  <th className="py-2.5 pr-4 font-medium">Actual delivery</th>
                  <th className="py-2.5 pr-4 font-medium">Delivery status</th>
                  <th className="py-2.5 pr-4 font-medium">Invoice status</th>
                </tr>
              </thead>
              <tbody>
                {vendorPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{purchase.vendorName}</td>
                    <td className="max-w-[220px] truncate py-3 pr-4">{purchase.productName}</td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {purchase.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatCurrency(purchase.purchaseCost)}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {formatDate(purchase.expectedDeliveryDate)}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {purchase.deliveryDate ? formatDate(purchase.deliveryDate) : 'Pending'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={deliveryStatusConfig[purchase.deliveryStatus].variant}>
                        {deliveryStatusConfig[purchase.deliveryStatus].label}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={invoiceStatusConfig[purchase.invoiceStatus].variant}>
                        {invoiceStatusConfig[purchase.invoiceStatus].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
