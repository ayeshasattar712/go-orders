import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Clock, MapPin } from 'lucide-react';
import { Rating } from '@/components/ui/rating';
import { Button } from '@/components/ui/button';
import type { Vendor } from '@/types/catalog';

export function VendorMiniCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center gap-3">
        <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" sizes="48px" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="hover:text-primary truncate font-semibold"
            >
              {vendor.name}
            </Link>
            {vendor.verified ? <BadgeCheck className="text-info h-4 w-4 shrink-0" /> : null}
          </div>
          <Rating value={vendor.rating} count={vendor.reviewCount} size="sm" />
        </div>
      </div>

      <div className="text-muted-foreground mt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {vendor.location}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Responds in {vendor.responseTime}
        </p>
      </div>

      <div className="bg-muted/50 mt-4 grid grid-cols-2 gap-3 rounded-lg p-3 text-center text-xs">
        <div>
          <p className="text-base font-semibold">{vendor.fulfillmentRate}%</p>
          <p className="text-muted-foreground">Fulfillment rate</p>
        </div>
        <div>
          <p className="text-base font-semibold">{vendor.yearsActive} yrs</p>
          <p className="text-muted-foreground">On GoOrder</p>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-4 w-full">
        <Link href={`/vendors/${vendor.slug}`}>Visit storefront</Link>
      </Button>
    </div>
  );
}
