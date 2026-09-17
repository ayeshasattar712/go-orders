'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import { CategoryIcon } from '@/components/shared/category-icon';
import {
  CatalogSectionControls,
  useCatalogSection,
} from '@/features/catalog/components/catalog-filter-button';
import { SortBySelect } from '@/features/catalog/components/product-toolbar';
import { categories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

const arrowBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-accent-brand/50 hover:bg-muted';

const chipClass = (active: boolean) =>
  cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
    active
      ? 'border-primary bg-primary text-white'
      : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted',
  );

export function JustForYou({
  products,
  eyebrow = 'Personalized',
  title = 'Just for you',
  description,
  viewAllHref = '/products',
  showControls = true,
  layout = 'scroll',
  gridLimit = 8,
  sectionId = 'picks',
  showCategoryChips = false,
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  description?: string;
  viewAllHref?: string;
  /** Hide the Filters/Sort by controls — useful for compact homepage rails. */
  showControls?: boolean;
  /** 'scroll' = horizontal carousel (default). 'grid' = static 4-per-row grid. */
  layout?: 'scroll' | 'grid';
  /** Max products shown in 'grid' layout. */
  gridLimit?: number;
  /** Anchor id — override when rendering more than one instance on a page. */
  sectionId?: string;
  /** Show an "All / category…" pill row + Sort by, and filter the grid by it. */
  showCategoryChips?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sort, setSort, filters, setFilters, resetFilters, maxPrice, allProducts, visible } =
    useCatalogSection(products);

  const availableCategories = useMemo(() => {
    const slugs = new Set(products.map((product) => product.categorySlug));
    return categories.filter((category) => slugs.has(category.slug));
  }, [products]);

  if (products.length === 0) return null;

  const gridProducts = showCategoryChips ? visible : products;

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section id={sectionId} className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
        </div>
        {showControls ? (
          <CatalogSectionControls
            sort={sort}
            onSortChange={setSort}
            filters={filters}
            onFiltersChange={setFilters}
            onFiltersReset={resetFilters}
            maxPrice={maxPrice}
            products={allProducts}
          />
        ) : null}
      </div>

      {showCategoryChips ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 scrollbar-none gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, categorySlug: null })}
              className={chipClass(!filters.categorySlug)}
            >
              All
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilters({ ...filters, categorySlug: category.slug })}
                className={chipClass(filters.categorySlug === category.slug)}
              >
                <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                {category.name}
              </button>
            ))}
          </div>
          <SortBySelect sort={sort} onSortChange={setSort} className="shrink-0" />
        </div>
      ) : null}

      {layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {gridProducts.slice(0, gridLimit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
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
            className="flex min-w-0 flex-1 snap-x scrollbar-none gap-3 overflow-x-auto pb-2 sm:gap-4"
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
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href={viewAllHref}
          className="group bg-primary shadow-primary/30 hover:shadow-primary/40 relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border-2 border-white px-6 py-2.5 text-sm font-bold text-white shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl hover:brightness-110"
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
          <span className="relative">View all</span>
          <ArrowUpRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
