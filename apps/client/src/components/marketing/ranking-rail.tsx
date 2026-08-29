import Link from 'next/link';
import Image from 'next/image';
import { getBestSellers } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';

export function RankingRail() {
  const ranked = getBestSellers(5);

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
              Rankings
            </p>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Top products</h2>
          </div>
          <Link href="/products?sort=bestsellers" className="text-sm text-white/60 hover:text-white">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ranked.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-primary/40"
            >
              <span className="font-display text-2xl font-semibold text-white/25">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                <Image
                  src={product.images[0] ?? ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-medium">{product.name}</span>
                <span className="text-primary mt-1 block text-sm font-semibold">
                  {formatCurrency(product.price)}
                </span>
                <Rating value={product.rating} size="sm" className="mt-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
