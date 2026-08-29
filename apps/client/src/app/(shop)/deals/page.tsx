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
      <div className="relative z-10 border-b border-border/60 bg-[#f8f9fa]">
        <div className="mx-auto max-w-7xl px-3 pt-6 pb-8 sm:px-4">
          <h1 className="text-2xl font-bold tracking-tight">Flash Sale</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed font-medium">
            Add to cart now. Login is only required when you place the order.
          </p>
        </div>
      </div>
      <FlashSaleSection products={getFlashDeals(12)} />
      <JustForYou products={getJustForYou(12)} />
    </>
  );
}
