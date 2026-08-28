import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, MapPin } from 'lucide-react';
import { getProducts, getVendors } from '@/lib/catalog/catalog-repository';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { VendorAvatar } from '@/components/shared/vendor-avatar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vendor Directory',
  description: 'Browse verified vendors on the GoOrder marketplace.',
};

export default async function VendorsPage() {
  const [vendors, products] = await Promise.all([getVendors(), getProducts()]);
  const approvedVendors = vendors.filter((vendor) => vendor.status === 'approved');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verified vendors</h1>
        <p className="text-muted-foreground mt-2">
          {approvedVendors.length} vetted suppliers across office furniture, IT, grocery, cleaning,
          and electrical categories.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {approvedVendors.map((vendor) => {
          const productCount = products.filter((p) => p.vendorId === vendor.id).length;
          return (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="card-hover bg-card rounded-2xl border"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-t-2xl">
                <Image
                  src={vendor.banner}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <div className="flex items-start gap-3 p-5">
                <VendorAvatar
                  name={vendor.name}
                  className="border-card -mt-12 h-16 w-16 shrink-0 rounded-xl border-4 text-base"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold">{vendor.name}</p>
                    {vendor.verified ? <BadgeCheck className="text-info h-4 w-4 shrink-0" /> : null}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" /> {vendor.location}
                  </p>
                  <Rating
                    value={vendor.rating}
                    count={vendor.reviewCount}
                    size="sm"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-5">
                <span className="text-muted-foreground text-xs">
                  {productCount} products listed
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.certifications.slice(0, 2).map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-[10px]">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
