import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryHero } from '@/features/catalog/components/category-hero';
import { CategoryExplorer } from '@/features/catalog/components/category-explorer';
import { ProductRail } from '@/components/shared/product-rail';
import { CategoryBreadcrumb } from '@/components/shared/category-breadcrumb';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import {
  getCategoryBySlug,
  getFeaturedProductsByCategory,
  getProductsByCategorySub,
  getRecommendedProductsByCategory,
} from '@/lib/catalog/catalog-repository';
import { getCategoryChildren, getCategoryGalleryImages } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found' };

  return {
    title: `${category.name} — Shop ${category.productCount.toLocaleString()}+ Products`,
    description: `${category.description} Browse ${category.name.toLowerCase()} on GoOrder with bulk pricing and fast delivery.`,
    openGraph: {
      title: category.name,
      description: category.description,
      images: [category.image],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sub } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const subcategoryName = sub
    ? (getCategoryChildren(category.slug).find((child) => child.slug === sub)?.name ?? null)
    : null;

  const session = await getCustomerSession();
  const [categoryProducts, featured, recommended] = await Promise.all([
    getProductsByCategorySub(category.slug, sub),
    getFeaturedProductsByCategory(category.slug, 8),
    getRecommendedProductsByCategory(category.slug, 8),
  ]);

  const listingTitle = subcategoryName ?? category.name;

  const galleryImages = getCategoryGalleryImages(category.slug, category.image);

  return (
    <div className="pb-16">
      <CategoryBreadcrumb currentName={listingTitle} />

      <div className="mt-4">
        <CategoryHero
          category={category}
          activeSub={sub}
          galleryImages={galleryImages}
          products={categoryProducts}
        />
      </div>

      {categoryProducts.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-xl border border-dashed py-16 text-center">
            <h2 className="text-lg font-medium">Products coming soon</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              We&apos;re adding more {category.name.toLowerCase()} soon. Check back shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!sub && !session && featured.length > 0 ? (
            <ProductRail
              title="Featured products"
              description={`Top-rated ${listingTitle.toLowerCase()} picked for your business.`}
              products={featured}
            />
          ) : null}

          {!sub && session && recommended.length > 0 ? (
            <ProductRail
              title="Recommended for you"
              description="Highly rated options based on what customers like you order."
              products={recommended}
            />
          ) : null}

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <CategoryExplorer products={categoryProducts} />
          </div>
        </>
      )}
    </div>
  );
}
