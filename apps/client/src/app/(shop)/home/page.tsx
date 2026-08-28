import { MarketplaceHero } from '@/components/marketing/marketplace-hero';
import { ChannelShortcuts } from '@/components/marketing/channel-shortcuts';
import { FlashSaleSection } from '@/components/marketing/flash-sale-section';
import { JustForYou } from '@/components/marketing/just-for-you';
import { ProductRail } from '@/components/shared/product-rail';
import { VendorRail } from '@/components/marketing/vendor-rail';
import { getBestSellers, getFlashDeals, getJustForYou, getTrendingProducts } from '@/lib/mock-data';

/** Marketplace homepage — requires customer session (see CUSTOMER_ROUTES). */
export default function MarketplaceHomePage() {
  const flashDeals = getFlashDeals(6);
  const mallPicks = getBestSellers(8);
  const trending = getTrendingProducts(8);
  const forYou = getJustForYou(18);

  return (
    <>
      <MarketplaceHero />
      <ChannelShortcuts />
      <FlashSaleSection products={flashDeals} />
      <ProductRail
        title="GoOrder Mall"
        description="Official brand stores and verified sellers."
        products={mallPicks}
        viewAllHref="/vendors"
      />
      <ProductRail
        title="Trending now"
        description="What shoppers are buying today."
        products={trending}
        viewAllHref="/products?sort=trending"
      />
      <VendorRail />
      <JustForYou products={forYou} />
    </>
  );
}
