import { formatCurrency } from '@/lib/utils';
import type { BulkPriceTier } from '@/types/catalog';

export function BulkPricingTable({ tiers, unit }: { tiers: BulkPriceTier[]; unit: string }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
          <tr>
            <th className="px-4 py-2.5 font-medium">Quantity</th>
            <th className="px-4 py-2.5 font-medium">Price per {unit}</th>
            <th className="px-4 py-2.5 font-medium">Savings</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, index) => {
            const basePrice = tiers[0]?.price ?? tier.price;
            const savings = index === 0 ? 0 : Math.round(100 - (tier.price / basePrice) * 100);
            return (
              <tr key={`${tier.minQty}-${tier.maxQty}`} className="border-t">
                <td className="px-4 py-2.5">
                  {tier.maxQty ? `${tier.minQty} - ${tier.maxQty}` : `${tier.minQty}+`}
                </td>
                <td className="px-4 py-2.5 font-medium">{formatCurrency(tier.price)}</td>
                <td className="text-success px-4 py-2.5">
                  {savings > 0 ? `Save ${savings}%` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
