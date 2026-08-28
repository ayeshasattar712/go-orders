import type { Metadata } from 'next';
import { DollarSign, PackageCheck, TrendingUp, Truck, Users, Warehouse } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueTrendChart, CategoryBarChart, DonutChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils';
import {
  categoryRevenue,
  monthlyRevenue,
  vendorPerformanceScores,
  warehouses,
} from '@/lib/mock-data';

export const metadata: Metadata = { title: 'Business Intelligence' };

const inventoryValueByWarehouse = warehouses.map((w) => ({
  label: w.warehouseName
    .replace(' Distribution Center', '')
    .replace(' Regional Hub', '')
    .replace(' Fulfillment Center', '')
    .replace(' East Hub', ''),
  value: w.usedUnits,
  color: [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ][warehouses.indexOf(w) % 4]!,
}));

export default function BusinessIntelligencePage() {
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = monthlyRevenue.reduce((sum, m) => sum + m.profit, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Executive overview</h2>
        <p className="text-muted-foreground">
          Real-time performance across revenue, procurement, and fulfillment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue (7 mo)"
          value={formatCurrency(totalRevenue)}
          delta={12.4}
          icon={DollarSign}
          iconTone="primary"
        />
        <KpiCard
          label="Gross profit"
          value={formatCurrency(totalProfit)}
          delta={9.8}
          icon={TrendingUp}
          iconTone="success"
        />
        <KpiCard
          label="Inventory value"
          value={formatCurrency(2_840_000)}
          delta={-2.1}
          icon={Warehouse}
          iconTone="warning"
        />
        <KpiCard label="Active customers" value="48,214" delta={5.6} icon={Users} iconTone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & profit trend</CardTitle>
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
            <CardTitle>Inventory value by warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={inventoryValueByWarehouse} />
            <div className="mt-2 space-y-1.5">
              {inventoryValueByWarehouse.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">{item.value.toLocaleString()} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryRevenue} layout="vertical" height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor performance (fulfillment %)</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart
              data={vendorPerformanceScores}
              layout="vertical"
              height={260}
              color="hsl(var(--success))"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-success/10 text-success flex h-10 w-10 items-center justify-center rounded-xl">
              <PackageCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-muted-foreground text-sm">Procurement spend (MTD)</p>
              <p className="text-lg font-bold">{formatCurrency(184_200)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-info/10 text-info flex h-10 w-10 items-center justify-center rounded-xl">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-muted-foreground text-sm">On-time delivery rate</p>
              <p className="text-lg font-bold">98.2%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-muted-foreground text-sm">Customer satisfaction</p>
              <p className="text-lg font-bold">4.7 / 5.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
