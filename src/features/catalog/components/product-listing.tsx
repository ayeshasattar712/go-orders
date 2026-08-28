'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductFilters, type CatalogFilters } from '@/features/catalog/components/product-filters';
import { ProductToolbar, type SortOption } from '@/features/catalog/components/product-toolbar';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

const MAX_PRICE = Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100;

const DEFAULT_FILTERS: CatalogFilters = {
  categorySlug: null,
  vendorIds: [],
  priceRange: [0, MAX_PRICE],
  minRating: null,
  inStockOnly: false,
  bulkOnly: false,
};

export function ProductListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const initialCategory = searchParams.get('category');

  const [filters, setFilters] = useState<CatalogFilters>({
    ...DEFAULT_FILTERS,
    categorySlug: initialCategory ?? null,
  });
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      if (
        query &&
        !product.name.toLowerCase().includes(query) &&
        !product.tags.some((t) => t.includes(query))
      ) {
        return false;
      }
      if (filters.categorySlug && product.categorySlug !== filters.categorySlug) return false;
      if (filters.vendorIds.length && !filters.vendorIds.includes(product.vendorId)) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])
        return false;
      if (filters.minRating && product.rating < filters.minRating) return false;
      if (filters.inStockOnly && product.stockStatus === 'out-of-stock') return false;
      if (filters.bulkOnly && product.bulkPricing.length < 2) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });

    return result;
  }, [filters, sort, query]);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    router.replace('/products');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? `Results for "${query}"` : 'Shop all products'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Advanced filters, bulk pricing, and vetted vendors across every category.
        </p>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            maxPrice={MAX_PRICE}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProductFilters
                    filters={filters}
                    onChange={setFilters}
                    onReset={resetFilters}
                    maxPrice={MAX_PRICE}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <ProductToolbar
            resultCount={filtered.length}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try adjusting price range, vendor, or rating filters."
              action={
                <Button onClick={resetFilters} variant="outline">
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div
              className={cn(
                view === 'grid'
                  ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-4',
              )}
            >
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} layout={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
