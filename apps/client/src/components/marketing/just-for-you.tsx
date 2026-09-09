'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import {
  CatalogSectionControls,
  useCatalogSection,
} from '@/features/catalog/components/catalog-filter-button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

const arrowBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50';

export function JustForYou({
  products,
  eyebrow = 'Personalized',
  title = 'Just for you',
  description,
  viewAllHref = '/products',
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  description?: string;
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sort, setSort, visible } = useCatalogSection(products);

  if (products.length === 0) return null;

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section id="picks" className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          ) : null}
        </div>
        <CatalogSectionControls sort={sort} onSortChange={setSort} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(arrowBtnClass, 'hidden sm:flex')}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div
          ref={scrollRef}
          className="scrollbar-none flex min-w-0 flex-1 snap-x gap-3 overflow-x-auto pb-2 sm:gap-4"
        >
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-[200px] min-w-0 shrink-0 snap-start sm:w-[240px]"
            />
          ))}
        </div>

        <button
          type="button"
          className={cn(arrowBtnClass, 'hidden sm:flex')}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-5 flex justify-center">
        <Link href={viewAllHref} className="text-primary text-sm font-semibold hover:underline">
          View all
        </Link>
      </div>
    </section>
  );
}
