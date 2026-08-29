import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IT_EQUIPMENT_IMAGE, OFFICE_SUPPLIES_IMAGE } from '@/lib/mock-data/categories';

export function PromoBannerGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
        <Link
          href="/categories/it-equipment"
          className="bg-navy relative min-h-[280px] overflow-hidden rounded-2xl p-8 text-white lg:col-span-5 lg:row-span-2"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">Featured</p>
          <h3 className="font-display mt-3 max-w-[14ch] text-3xl font-semibold">
            Business laptops for every team
          </h3>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Certified IT gear with bulk tiers and next-day dispatch.
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Shop IT <ArrowRight className="h-4 w-4" />
          </span>
          <Image
            src={IT_EQUIPMENT_IMAGE}
            alt="Laptop"
            width={380}
            height={280}
            className="pointer-events-none absolute right-[-8%] bottom-[-10%] w-[62%] object-contain drop-shadow-2xl"
          />
        </Link>

        <Link
          href="/deals"
          className="relative min-h-[200px] overflow-hidden rounded-2xl bg-primary p-7 text-white lg:col-span-4"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">Hot deal</p>
          <h3 className="font-display mt-2 text-3xl font-semibold">Grab up to 40% off</h3>
          <p className="mt-1 text-sm text-white/80">Limited-time office and audio bundles.</p>
          <Button
            asChild
            size="sm"
            className="mt-5 bg-white text-primary hover:bg-white/90"
          >
            <span>
              Shop deals <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Button>
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop"
            alt="Headphones"
            width={180}
            height={180}
            className="pointer-events-none absolute right-2 bottom-0 w-36 rounded-full object-cover"
          />
        </Link>

        <Link
          href="/categories/office-furniture"
          className="relative min-h-[200px] overflow-hidden rounded-2xl bg-[#d8f3dc] p-6 lg:col-span-3"
        >
          <p className="text-xs font-semibold tracking-wide text-emerald-800/70 uppercase">Workspace</p>
          <h3 className="font-display mt-1 text-xl font-semibold">Standing desks</h3>
          <p className="text-muted-foreground mt-1 text-sm">Ergonomic setups from $249.</p>
          <Image
            src="https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=500&auto=format&fit=crop"
            alt="Standing desk"
            width={160}
            height={120}
            className="pointer-events-none absolute right-0 bottom-0 w-32 object-contain"
          />
        </Link>

        <Link
          href="/categories/electrical-products"
          className="relative min-h-[200px] overflow-hidden rounded-2xl bg-[#fff3c4] p-6 lg:col-span-4"
        >
          <p className="text-xs font-semibold tracking-wide text-amber-800/70 uppercase">Lighting</p>
          <h3 className="font-display mt-1 text-xl font-semibold">LED panels & power</h3>
          <p className="text-muted-foreground mt-1 text-sm">Facility-ready electrical hardware.</p>
          <Image
            src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=500&auto=format&fit=crop"
            alt="Camera lighting"
            width={150}
            height={110}
            className="pointer-events-none absolute right-2 bottom-2 w-28 rounded-lg object-cover"
          />
        </Link>

        <Link
          href="/categories/office-supplies"
          className="flex min-h-[200px] flex-col overflow-hidden rounded-2xl bg-[#e8e4ff] lg:col-span-3"
        >
          <div className="p-5 pb-3">
            <p className="text-xs font-semibold tracking-wide text-primary/80 uppercase">
              Essentials
            </p>
            <h3 className="font-display mt-1 text-lg font-semibold leading-tight">Office supplies</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-snug">
              Paper, pens, and bulk packs.
            </p>
          </div>
          <div className="relative mt-auto h-[92px] w-full shrink-0 overflow-hidden">
            <Image
              src={OFFICE_SUPPLIES_IMAGE}
              alt="Office supplies — pens, paper, and stationery"
              fill
              sizes="320px"
              className="object-cover object-center"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
