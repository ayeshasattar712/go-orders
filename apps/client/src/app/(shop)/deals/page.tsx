import type { Metadata } from 'next';
import { FlashSaleSection } from '@/components/marketing/flash-sale-section';
import { JustForYou } from '@/components/marketing/just-for-you';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { getCatalogHighlight, getFlashDeals } from '@/lib/catalog/catalog-repository';

export const metadata: Metadata = {
  title: 'Flash Sale',
  description: 'Limited-time marketplace deals with countdown pricing.',
};

export default async function DealsPage() {
  const session = await getCustomerSession();
  const [deals, highlight] = await Promise.all([
    getFlashDeals(12),
    getCatalogHighlight(session?.sub ?? null, 12),
  ]);
  const isRecommended = highlight.kind === 'recommended';

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
      <FlashSaleSection products={deals} />
      <JustForYou
        products={highlight.products}
        eyebrow={isRecommended ? 'Personalized' : 'Catalog'}
        title={isRecommended ? 'Recommended for you' : 'Featured products'}
        description={
          isRecommended
            ? 'Picked from categories you order — plus top-rated items to try next.'
            : 'Hand-picked catalog highlights. Sign in to get personal recommendations.'
        }
      />
    </>
  );
}
