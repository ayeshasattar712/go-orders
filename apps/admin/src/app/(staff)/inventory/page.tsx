import type { Metadata } from 'next';
import { AlertTriangle, Boxes, PackageSearch, Warehouse } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StockStatusBadge } from '@/features/inventory/stock-status-badge';
import { useInventoryItems, useWarehouses, useDemandForecasts } from '@/services/queries';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Inventory Management' };

export default function InventoryPage() {
  const { data: inventoryData } = useInventoryItems();
  const { data: warehousesData } = useWarehouses();
  const { data: forecastsData } = useDemandForecasts();

  const inventoryItems = inventoryData?.items ?? [];
  const warehouses = warehousesData?.warehouses ?? [];
  const demandForecasts = forecastsData?.items ?? [];

  const criticalCount = inventoryItems.filter((i) => i.status === 'critical').length;
  const lowCount = inventoryItems.filter((i) => i.status === 'low').length;
  const totalUnits = inventoryItems.reduce((sum, i) => sum + i.onHand, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Inventory management</h2>
        <p className="text-muted-foreground">
          Stock levels, warehouse capacity, and reorder recommendations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total SKUs tracked"
          value={inventoryItems.length.toString()}
          icon={Boxes}
          iconTone="primary"
        />
        <KpiCard
          label="Units on hand"
          value={totalUnits.toLocaleString()}
          icon={PackageSearch}
          iconTone="info"
        />
        <KpiCard
          label="Critical alerts"
          value={criticalCount.toString()}
          icon={AlertTriangle}
          iconTone="destructive"
        />
        <KpiCard
          label="Low stock warnings"
          value={lowCount.toString()}
          icon={AlertTriangle}
          iconTone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse capacity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Warehouse className="text-primary h-4 w-4" /> {warehouse.warehouseName}
              </div>
              <p className="text-muted-foreground text-xs">{warehouse.location}</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Utilization</span>
                  <span
                    className={cn('font-medium', warehouse.utilization > 85 && 'text-destructive')}
                  >
                    {warehouse.utilization}%
                  </span>
                </div>
                <Progress value={warehouse.utilization} className="h-1.5" />
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {warehouse.usedUnits.toLocaleString()} / {warehouse.capacityUnits.toLocaleString()}{' '}
                units
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock levels</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
              <tr className="border-b">
                <th className="py-2.5 pr-4 font-medium">Product</th>
                <th className="py-2.5 pr-4 font-medium">Warehouse</th>
                <th className="py-2.5 pr-4 font-medium">On hand</th>
                <th className="py-2.5 pr-4 font-medium">Reserved</th>
                <th className="py-2.5 pr-4 font-medium">Reorder point</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">{item.sku}</p>
                  </td>
                  <td className="text-muted-foreground py-3 pr-4">{item.warehouse}</td>
                  <td className="py-3 pr-4 font-medium">{item.onHand}</td>
                  <td className="text-muted-foreground py-3 pr-4">{item.reserved}</td>
                  <td className="py-3 pr-4">{item.reorderPoint}</td>
                  <td className="py-3 pr-4">
                    <StockStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reorder recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {demandForecasts
            .filter((f) => f.suggestedReorderQty > 0)
            .map((forecast) => (
              <div
                key={forecast.id}
                className="flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">{forecast.product}</p>
                  <p className="text-muted-foreground text-xs">
                    Predicted demand: {forecast.predictedDemand} units · Confidence{' '}
                    {forecast.confidence}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Reorder {forecast.suggestedReorderQty} units
                  </p>
                  <p className="text-muted-foreground text-xs">from {forecast.suggestedVendor}</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
