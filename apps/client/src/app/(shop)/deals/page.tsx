import type { Metadata } from 'next';
import { FlashSaleSection } from '@/components/marketing/flash-sale-section';
import { JustForYou } from '@/components/marketing/just-for-you';
import { getFlashDeals, getJustForYou } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Flash Sale',
  description: 'Limited-time marketplace deals with countdown pricing.',
};

export default function DealsPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-4">
        <h1 className="text-2xl font-bold tracking-tight">Flash Sale</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add to cart now. Login is only required when you place the order.
        </p>
      </div>
      <FlashSaleSection products={getFlashDeals(12)} />
      <JustForYou products={getJustForYou(12)} />
    </>
  );
}
