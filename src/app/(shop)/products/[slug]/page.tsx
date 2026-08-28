import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { ProductBuyBox } from '@/features/catalog/components/product-buy-box';
import { VendorMiniCard } from '@/features/catalog/components/vendor-mini-card';
import { BulkPricingTable } from '@/features/catalog/components/bulk-pricing-table';
import { ProductReviews } from '@/features/catalog/components/product-reviews';
import { FrequentlyBoughtTogether } from '@/features/catalog/components/frequently-bought-together';
import { ProductComparison } from '@/features/catalog/components/product-comparison';
import { ProductRail } from '@/components/shared/product-rail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getFrequentlyBoughtTogether,
  getProductBySlug,
  getRelatedProducts,
  products,
  vendors,
} from '@/lib/mock-data';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const vendor = vendors.find((item) => item.id === product.vendorId);
  const related = getRelatedProducts(product);
  const companions = getFrequentlyBoughtTogether(product, 2);
  const comparisonProducts = [product, ...related.slice(0, 2)];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground">
          {product.categorySlug.replace(/-/g, ' ')}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            <p className="text-muted-foreground mt-2">{product.shortDescription}</p>
          </div>

          <ProductBuyBox product={product} />
          {vendor ? <VendorMiniCard vendor={vendor} /> : null}
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="bulk-pricing">Bulk pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent
            value="description"
            className="text-muted-foreground max-w-3xl text-sm leading-relaxed"
          >
            {product.description}
          </TabsContent>

          <TabsContent value="specifications">
            <div className="max-w-2xl divide-y rounded-xl border">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bulk-pricing" className="max-w-2xl">
            <p className="text-muted-foreground mb-3 text-sm">
              Unlock automatic discounts as your order quantity increases.
            </p>
            <BulkPricingTable tiers={product.bulkPricing} unit={product.unit} />
          </TabsContent>

          <TabsContent value="reviews">
            <ProductReviews product={product} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12">
        <FrequentlyBoughtTogether mainProduct={product} companions={companions} />
      </div>

      {comparisonProducts.length > 1 ? (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Compare similar products</h2>
          <ProductComparison products={comparisonProducts} />
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-4">
          <ProductRail
            title="Related products"
            products={related}
            viewAllHref={`/categories/${product.categorySlug}`}
          />
        </div>
      ) : null}
    </div>
  );
}
