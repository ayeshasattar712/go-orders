import { MarketplaceHero } from '@/components/marketing/marketplace-hero';
import { TrustStrip } from '@/components/marketing/trust-strip';
import { CategoryIconStrip } from '@/components/marketing/category-icon-strip';
import { PromoBannerGrid } from '@/components/marketing/promo-banner-grid';
import { RankingRail } from '@/components/marketing/ranking-rail';
import { NewsletterBanner } from '@/components/marketing/newsletter-banner';
import { ProductVideoShowcase } from '@/components/marketing/product-video';
import { JustForYou } from '@/components/marketing/just-for-you';
import { ProductRail } from '@/components/shared/product-rail';
import { VendorRail } from '@/components/marketing/vendor-rail';
import { getBestSellers, getFlashDeals, getJustForYou, getTrendingProducts } from '@/lib/mock-data';

/** Marketplace homepage — requires customer session (see CUSTOMER_ROUTES). */
export default function MarketplaceHomePage() {
  const flashDeals = getFlashDeals(8);
  const mallPicks = getBestSellers(8);
  const trending = getTrendingProducts(8);
  const forYou = getJustForYou(12);

  return (
    <>
      <MarketplaceHero />
      <TrustStrip />
      <ProductVideoShowcase />
      <CategoryIconStrip />
      <PromoBannerGrid />
      <div className="bg-white">
        <ProductRail
          title="Hot deals"
          description="Limited-time savings on office, IT, and pantry staples."
          products={flashDeals}
          viewAllHref="/deals"
        />
      </div>
      <div className="bg-[#f8f9fa]">
        <ProductRail
          title="New arrivals"
          description="Fresh catalog drops for procurement teams."
          products={trending}
          viewAllHref="/products?sort=new"
        />
        <JustForYou products={forYou} />
      </div>
      <RankingRail />
      <div className="bg-white">
        <ProductRail
          title="GoOrder Mall"
          description="Official brand stores and verified sellers."
          products={mallPicks}
          viewAllHref="/vendors"
        />
        <VendorRail />
      </div>
      <NewsletterBanner />
    </>
  );
}
