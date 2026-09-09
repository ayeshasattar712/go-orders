import { Suspense } from 'react';
import { FeaturedProductsBanner } from '@/components/marketing/featured-products-banner';
import { CategoryProductLine } from '@/components/marketing/category-product-line';
import { CategoriesPanel } from '@/components/marketing/categories-panel';
import { NewsletterBanner } from '@/components/marketing/newsletter-banner';
import { JustForYou } from '@/components/marketing/just-for-you';
import { ProductRail } from '@/components/shared/product-rail';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import {
  getCatalogHighlight,
  getTrendingProducts,
} from '@/lib/catalog/catalog-repository';

async function HomeCatalogRails() {
  const session = await getCustomerSession();
  const [trending, highlight] = await Promise.all([
    getTrendingProducts(8),
    getCatalogHighlight(session?.sub ?? null, 12),
  ]);

  const isRecommended = highlight.kind === 'recommended';

  return (
    <>
      <div className="bg-[#f8f9fa]">
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
      </div>
      <div className="bg-white">
        <ProductRail
          title="New arrivals"
          description="Fresh catalog drops for procurement teams."
          products={trending}
          viewAllHref="/products?sort=new"
        />
      </div>
    </>
  );
}

function RailsFallback() {
  return (
    <div className="bg-[#f8f9fa] px-4 py-16 text-center">
      <p className="text-muted-foreground text-sm">Loading products…</p>
    </div>
  );
}

/** Marketplace homepage — public for guests, personalized after login. */
export default function MarketplaceHomePage() {
  return (
    <>
      <FeaturedProductsBanner />
      <CategoryProductLine />
      <CategoriesPanel />
      <Suspense fallback={<RailsFallback />}>
        <HomeCatalogRails />
      </Suspense>
      <NewsletterBanner />
    </>
  );
}
