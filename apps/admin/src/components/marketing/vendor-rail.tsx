import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { vendors } from '@/lib/mock-data';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';

export function VendorRail() {
  return (
    <section className="bg-muted/30 border-y py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Featured vendors</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Verified suppliers with proven fulfillment performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="card-hover group bg-card overflow-hidden rounded-xl border"
            >
              <div className="relative h-24 w-full overflow-hidden">
                <Image
                  src={vendor.banner}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="border-card bg-background relative -mt-10 h-14 w-14 shrink-0 overflow-hidden rounded-xl border-4">
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold">{vendor.name}</p>
                    {vendor.verified ? <BadgeCheck className="text-info h-4 w-4 shrink-0" /> : null}
                  </div>
                  <p className="text-muted-foreground text-xs">{vendor.location}</p>
                  <Rating
                    value={vendor.rating}
                    count={vendor.reviewCount}
                    size="sm"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                {vendor.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-[10px]">
                    {cert}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
