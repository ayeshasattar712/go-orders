import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { ProductBuyBox } from '@/features/catalog/components/product-buy-box';
import { ProductCard } from '@/components/shared/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProductBySlug, getRelatedProducts } from '@/lib/catalog/catalog-repository';
import { getCategoryGalleryImages } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 10);

  const galleryImages = Array.from(
    new Set([...product.images, ...getCategoryGalleryImages(product.categorySlug)]),
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-muted-foreground mb-6 flex items-center gap-1.5 overflow-x-auto text-sm whitespace-nowrap">
        <Link href="/home" className="hover:text-foreground">
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
        <ProductGallery images={galleryImages} name={product.name} />

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            <p className="text-muted-foreground mt-2">{product.shortDescription}</p>
          </div>

          <ProductBuyBox product={product} />
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
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
        </Tabs>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
                Shop
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Related products
              </h2>
            </div>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
