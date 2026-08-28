import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CategoryHero } from '@/features/catalog/components/category-hero';
import { CategoryExplorer } from '@/features/catalog/components/category-explorer';
import { VendorMiniCard } from '@/features/catalog/components/vendor-mini-card';
import { ProductRail } from '@/components/shared/product-rail';
import {
  categories,
  getBestSellersByCategory,
  getCategoryBySlug,
  getFeaturedProductsByCategory,
  getNewArrivalsByCategory,
  getProductsByCategory,
  getRecommendedProductsByCategory,
  getVendorsByCategory,
} from '@/lib/mock-data';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found' };

  return {
    title: `${category.name} — Shop ${category.productCount.toLocaleString()}+ Products`,
    description: `${category.description} Browse ${category.name.toLowerCase()} from vetted vendors on GoOrder with bulk pricing and fast delivery.`,
    openGraph: {
      title: category.name,
      description: category.description,
      images: [category.image],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(category.slug);
  const categoryVendors = getVendorsByCategory(category.id);
  const featured = getFeaturedProductsByCategory(category.slug, 8);
  const bestSellers = getBestSellersByCategory(category.slug, 8);
  const newArrivals = getNewArrivalsByCategory(category.slug, 8);
  const recommended = getRecommendedProductsByCategory(category.slug, 8);

  const avgRating = categoryProducts.length
    ? categoryProducts.reduce((sum, product) => sum + product.rating, 0) / categoryProducts.length
    : 0;

  return (
    <div className="pb-16">
      <nav className="text-muted-foreground mx-auto flex max-w-7xl items-center gap-1.5 px-4 pt-6 text-sm sm:px-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{category.name}</span>
      </nav>

      <div className="mt-4">
        <CategoryHero
          category={category}
          vendorCount={categoryVendors.length}
          avgRating={avgRating}
        />
      </div>

      {categoryProducts.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-xl border border-dashed py-16 text-center">
            <h2 className="text-lg font-medium">Products coming soon</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              We&apos;re onboarding vendors for {category.name}. Check back shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          {featured.length > 0 ? (
            <ProductRail
              title="Featured products"
              description={`Top-rated ${category.name.toLowerCase()} picked for your business.`}
              products={featured}
            />
          ) : null}

          {bestSellers.length > 0 ? (
            <ProductRail
              title="Best sellers"
              description="Most purchased by procurement teams this month."
              products={bestSellers}
            />
          ) : null}

          {newArrivals.length > 0 ? (
            <ProductRail
              title="New arrivals"
              description="Just added to this category."
              products={newArrivals}
            />
          ) : null}

          {recommended.length > 0 ? (
            <ProductRail
              title="Recommended for you"
              description="Highly rated options based on category demand."
              products={recommended}
            />
          ) : null}

          {categoryVendors.length > 0 ? (
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
              <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight">Vendors in {category.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Verified suppliers with proven fulfillment performance.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryVendors.map((vendor) => (
                  <VendorMiniCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <CategoryExplorer
              categorySlug={category.slug}
              products={categoryProducts}
              vendors={categoryVendors}
            />
          </div>
        </>
      )}
    </div>
  );
}
