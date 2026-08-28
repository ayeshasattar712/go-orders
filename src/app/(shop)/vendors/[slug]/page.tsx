import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BadgeCheck, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { vendors, products } from '@/lib/mock-data';
import { ProductCard } from '@/components/shared/product-card';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

type VendorPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return vendors.map((vendor) => ({ slug: vendor.slug }));
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = vendors.find((item) => item.slug === slug);
  if (!vendor) return { title: 'Vendor not found' };
  return { title: vendor.name, description: `${vendor.name} storefront on GoOrder marketplace.` };
}

const performanceMetrics = (vendor: (typeof vendors)[number]) => [
  { label: 'Fulfillment rate', value: vendor.fulfillmentRate },
  { label: 'On-time delivery', value: 96.8 },
  { label: 'Response rate', value: 99.1 },
  { label: 'Order accuracy', value: 98.4 },
];

export default async function VendorStorefrontPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendor = vendors.find((item) => item.slug === slug);
  if (!vendor) notFound();

  const vendorProducts = products.filter((product) => product.vendorId === vendor.id);
  const allReviews = vendorProducts.flatMap((product) => product.reviews);

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src={vendor.banner}
          alt={vendor.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="border-background bg-card relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 shadow-lg">
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{vendor.name}</h1>
                {vendor.verified ? <BadgeCheck className="text-info h-5 w-5" /> : null}
              </div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5" /> {vendor.location} · On GoOrder for{' '}
                {vendor.yearsActive} years
              </p>
            </div>
          </div>
          <Rating value={vendor.rating} count={vendor.reviewCount} showValue size="lg" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <Tabs defaultValue="catalog">
              <TabsList>
                <TabsTrigger value="catalog">Catalog ({vendorProducts.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({allReviews.length})</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="catalog">
                {vendorProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No products listed yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {vendorProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-5">
                {allReviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.author}</p>
                      <Rating value={review.rating} size="sm" />
                    </div>
                    <p className="mt-1 text-sm font-medium">{review.title}</p>
                    <p className="text-muted-foreground text-sm">{review.body}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="certifications">
                <div className="grid gap-3 sm:grid-cols-2">
                  {vendor.certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-3 rounded-xl border p-4">
                      <span className="bg-success/10 text-success flex h-10 w-10 items-center justify-center rounded-lg">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium">{cert}</p>
                        <p className="text-muted-foreground text-xs">
                          Verified by GoOrder compliance team
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border p-5">
              <h3 className="mb-3 font-semibold">Performance metrics</h3>
              <div className="space-y-3">
                {performanceMetrics(vendor).map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Responds in {vendor.responseTime}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {vendor.categories.map((catId) => (
                  <Badge key={catId} variant="secondary">
                    {catId.replace('cat_', '').replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
