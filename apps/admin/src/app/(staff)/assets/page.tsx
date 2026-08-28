import type { Metadata } from 'next';
import { Boxes, DollarSign, Wrench, ShieldAlert } from 'lucide-react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { assets } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Asset Management' };

const statusVariant: Record<string, BadgeProps['variant']> = {
  'in-use': 'success',
  'in-storage': 'info',
  maintenance: 'warning',
  retired: 'secondary',
};

export default function AssetsPage() {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const inMaintenance = assets.filter((a) => a.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Asset management</h2>
        <p className="text-muted-foreground">
          Track company assets, assignments, and maintenance schedules.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total assets"
          value={assets.length.toString()}
          icon={Boxes}
          iconTone="primary"
        />
        <KpiCard
          label="Total asset value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          iconTone="success"
        />
        <KpiCard
          label="In maintenance"
          value={inMaintenance.toString()}
          icon={Wrench}
          iconTone="warning"
        />
        <KpiCard
          label="Maintenance due (30d)"
          value="1"
          icon={ShieldAlert}
          iconTone="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset registry</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-muted-foreground text-left text-xs tracking-wide uppercase">
              <tr className="border-b">
                <th className="py-2.5 pr-4 font-medium">Asset</th>
                <th className="py-2.5 pr-4 font-medium">Assigned to</th>
                <th className="py-2.5 pr-4 font-medium">Location</th>
                <th className="py-2.5 pr-4 font-medium">Value</th>
                <th className="py-2.5 pr-4 font-medium">Next maintenance</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {asset.tag} · {asset.category}
                    </p>
                  </td>
                  <td className="text-muted-foreground py-3 pr-4">{asset.assignedTo}</td>
                  <td className="text-muted-foreground py-3 pr-4">{asset.location}</td>
                  <td className="py-3 pr-4 font-medium">{formatCurrency(asset.value)}</td>
                  <td className="text-muted-foreground py-3 pr-4">
                    {asset.nextMaintenance === '—' ? '—' : formatDate(asset.nextMaintenance)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant[asset.status]}>
                      {asset.status.replace('-', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
