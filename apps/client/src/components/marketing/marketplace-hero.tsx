import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTrendingProducts } from '@/lib/mock-data';
import { PlayCatalogVideoButton } from '@/components/marketing/product-video';

export function MarketplaceHero() {
  const featured = getTrendingProducts(3);

  return (
    <section className="bg-navy-glow relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="text-primary mb-4 text-xs font-semibold tracking-[0.28em] uppercase">
            Corporate marketplace
          </p>
          <h1 className="font-display text-3xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Everything Your Business Needs in <span className="text-gradient-brand">One Place</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed font-medium text-white/80">
            Shop office supplies, furniture, groceries, and IT equipment while managing procurement,
            invoices, deliveries, and credit purchases effortlessly.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <PlayCatalogVideoButton />
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[480px]">
          <div className="bg-primary/35 absolute inset-[8%] rounded-full blur-3xl" />
          <div className="glow-purple border-primary/40 absolute inset-[16%] rounded-full border" />
          {featured[0] ? (
            <div className="absolute top-[16%] left-1/2 z-10 h-[48%] w-[48%] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
              <Image
                src={featured[0].images[0] ?? ''}
                alt={featured[0].name}
                fill
                priority
                className="object-cover"
                sizes="240px"
              />
            </div>
          ) : null}
          {featured[1] ? (
            <div className="absolute bottom-[14%] left-[6%] z-20 h-[34%] w-[34%] overflow-hidden rounded-2xl border border-white/15 shadow-xl">
              <Image
                src={featured[1].images[0] ?? ''}
                alt={featured[1].name}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          ) : null}
          {featured[2] ? (
            <div className="absolute right-[6%] bottom-[18%] z-20 h-[30%] w-[30%] overflow-hidden rounded-2xl border border-white/15 shadow-xl">
              <Image
                src={featured[2].images[0] ?? ''}
                alt={featured[2].name}
                fill
                className="object-cover"
                sizes="140px"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
