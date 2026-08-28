import { HeroSection } from '@/components/marketing/hero-section';
import { CategoryGrid } from '@/components/marketing/category-grid';
import { ProductRail } from '@/components/shared/product-rail';
import { VendorRail } from '@/components/marketing/vendor-rail';
import { AIRecommendations } from '@/components/marketing/ai-recommendations';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { getBestSellers, getRecommendedProducts, getTrendingProducts } from '@/lib/mock-data';

export default function HomePage() {
  const trending = getTrendingProducts();
  const bestSellers = getBestSellers();
  const recommended = getRecommendedProducts();

  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <ProductRail
        title="Trending now"
        description="Popular across enterprise buyers this week."
        products={trending}
        viewAllHref="/products?sort=trending"
      />
      <ProductRail
        title="Best sellers"
        description="The most reordered products on GoOrder."
        products={bestSellers}
        viewAllHref="/products?sort=best-sellers"
      />
      <VendorRail />
      <ProductRail
        title="Recommended for your business"
        description="Curated based on your category and order history."
        products={recommended}
        viewAllHref="/products"
      />
      <AIRecommendations />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
