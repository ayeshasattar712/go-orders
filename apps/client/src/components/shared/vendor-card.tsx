import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, MapPin } from 'lucide-react';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { VendorAvatar } from '@/components/shared/vendor-avatar';
import type { Vendor } from '@/types/catalog';

interface VendorCardProps {
  vendor: Vendor;
  productCount?: number;
  compact?: boolean;
}

export function VendorCard({ vendor, productCount, compact = false }: VendorCardProps) {
  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="card-hover group bg-card relative flex flex-col overflow-hidden rounded-2xl border"
    >
      <div className={compact ? 'relative h-32 w-full' : 'relative h-40 w-full'}>
        <Image
          src={vendor.banner}
          alt={`${vendor.name} storefront`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      <div className="relative px-5 pb-5">
        <VendorAvatar
          name={vendor.name}
          logo={vendor.logo}
          className="border-card absolute top-0 left-5 z-10 h-16 w-16 -translate-y-1/2 rounded-xl border-4 bg-white shadow-md"
        />

        <div className="flex items-start gap-3 pt-10">
          <div className="w-16 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold">{vendor.name}</p>
              {vendor.verified ? <BadgeCheck className="text-info h-4 w-4 shrink-0" /> : null}
            </div>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 shrink-0" /> {vendor.location}
            </p>
            <Rating
              value={vendor.rating}
              count={vendor.reviewCount}
              size="sm"
              className="mt-1.5"
            />
          </div>
        </div>

        {productCount !== undefined ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">{productCount} products listed</span>
            <div className="flex flex-wrap gap-1.5">
              {vendor.certifications.slice(0, 2).map((cert) => (
                <Badge key={cert} variant="secondary" className="text-[10px]">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {vendor.certifications.map((cert) => (
              <Badge key={cert} variant="secondary" className="text-[10px]">
                {cert}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
