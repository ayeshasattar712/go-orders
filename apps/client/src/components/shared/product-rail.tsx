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

interface ProductRailProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
}

const arrowBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-accent-brand/50 hover:bg-muted';

export function ProductRail({ title, description, products, viewAllHref }: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sort, setSort, filters, setFilters, resetFilters, maxPrice, allProducts, visible } =
    useCatalogSection(products);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
            Shop
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
        </div>
        <CatalogSectionControls
          sort={sort}
          onSortChange={setSort}
          filters={filters}
          onFiltersChange={setFilters}
          onFiltersReset={resetFilters}
          maxPrice={maxPrice}
          products={allProducts}
        />
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
          className="flex min-w-0 flex-1 snap-x scrollbar-none gap-4 overflow-x-auto pb-2"
        >
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-[240px] min-w-0 shrink-0 snap-start sm:w-[260px]"
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

      {viewAllHref ? (
        <div className="mt-5 flex justify-center">
          <Link href={viewAllHref} className="text-primary text-sm font-semibold hover:underline">
            View all
          </Link>
        </div>
      ) : null}
    </section>
  );
}
