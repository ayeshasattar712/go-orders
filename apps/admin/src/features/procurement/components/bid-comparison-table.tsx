'use client';

import { Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import type { Bid } from '@/types/enterprise';

export function BidComparisonTable({
  bids,
  onSelect,
}: {
  bids: Bid[];
  onSelect?: (bid: Bid) => void;
}) {
  const lowestPrice = Math.min(...bids.map((b) => b.amount));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {bids.map((bid) => (
        <div
          key={bid.id}
          className={cn(
            'flex flex-col rounded-2xl border p-5',
            bid.recommended && 'border-primary bg-primary/5 ring-primary/20 ring-1',
          )}
        >
          {bid.recommended ? (
            <span className="bg-primary text-primary-foreground mb-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
              <Award className="h-3.5 w-3.5" /> AI recommended
            </span>
          ) : null}
          <p className="font-semibold">{bid.vendorName}</p>
          <Rating value={bid.rating} size="sm" className="mt-1" />

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quoted price</span>
              <span className={cn('font-semibold', bid.amount === lowestPrice && 'text-success')}>
                {formatCurrency(bid.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery time</span>
              <span>{bid.deliveryDays} days</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Match score</span>
              <span className="font-medium">{bid.score}/100</span>
            </div>
            <Progress value={bid.score} className="h-1.5" />
          </div>

          <Button
            variant={bid.recommended ? 'default' : 'outline'}
            size="sm"
            className="mt-4"
            onClick={() => onSelect?.(bid)}
          >
            <CheckCircle2 className="h-4 w-4" /> Select vendor
          </Button>
        </div>
      ))}
    </div>
  );
}
