import { Suspense } from 'react';
import { HeroSection } from '@/components/marketing/hero-section';
import { ShopByCategoryGrid } from '@/components/marketing/shop-by-category-grid';
import { JustForYou } from '@/components/marketing/just-for-you';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import {
  getFeaturedProducts,
  getRecommendedProducts,
  getRecommendedProductsForUser,
} from '@/lib/catalog/catalog-repository';

async function HomeCatalogRails() {
  const session = await getCustomerSession();
  const [featured, recommendedRaw] = await Promise.all([
    getFeaturedProducts(60),
    session?.sub ? getRecommendedProductsForUser(session.sub, 60) : getRecommendedProducts(120),
  ]);

  const featuredIds = new Set(featured.map((product) => product.id));
  const recommended = session?.sub
    ? recommendedRaw
    : recommendedRaw.filter((product) => !featuredIds.has(product.id)).slice(0, 60);

  return (
    <div className="bg-background">
      <JustForYou
        sectionId="featured-products"
        products={featured}
        eyebrow="Catalog"
        title="Featured products"
        description="Hand-picked catalog highlights."
        showControls={false}
        layout="grid"
      />
      <JustForYou
        sectionId="just-for-you"
        products={recommended}
        eyebrow="Personalized"
        title="Just for you"
        description={
          session?.sub
            ? 'Picked from categories you order — plus top-rated items to try next.'
            : 'More top-rated picks from across the catalog.'
        }
        showControls={false}
        layout="grid"
      />
    </div>
  );
}

function RailsFallback() {
  return (
    <div className="bg-background px-4 py-16 text-center">
      <p className="text-muted-foreground text-sm">Loading products…</p>
    </div>
  );
}

/** Marketplace homepage — public for guests, personalized after login. */
export default function MarketplaceHomePage() {
  return (
    <>
      <HeroSection />
      <ShopByCategoryGrid />
      <Suspense fallback={<RailsFallback />}>
        <HomeCatalogRails />
      </Suspense>
    </>
  );
}
