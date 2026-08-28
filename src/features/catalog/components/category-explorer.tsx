'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductFilters, type CatalogFilters } from '@/features/catalog/components/product-filters';
import { ProductToolbar, type SortOption } from '@/features/catalog/components/product-toolbar';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Product, Vendor } from '@/types/catalog';

interface CategoryExplorerProps {
  categorySlug: string;
  products: Product[];
  vendors: Vendor[];
}

const PAGE_SIZE = 9;

export function CategoryExplorer({ categorySlug, products, vendors }: CategoryExplorerProps) {
  const maxPrice = useMemo(
    () => (products.length ? Math.ceil(Math.max(...products.map((p) => p.price)) / 50) * 50 : 100),
    [products],
  );

  const defaultFilters: CatalogFilters = useMemo(
    () => ({
      categorySlug,
      vendorIds: [],
      priceRange: [0, maxPrice],
      minRating: null,
      inStockOnly: false,
      bulkOnly: false,
    }),
    [categorySlug, maxPrice],
  );

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products.filter((product) => {
      if (
        q &&
        !product.name.toLowerCase().includes(q) &&
        !product.shortDescription.toLowerCase().includes(q) &&
        !product.tags.some((tag) => tag.includes(q))
      ) {
        return false;
      }
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
  }, [products, query, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(next: CatalogFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  function resetFilters() {
    setQuery('');
    setFilters(defaultFilters);
    setPage(1);
  }

  return (
    <div id="category-products" className="scroll-mt-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">All products in this category</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Filter by vendor, price, rating, and availability.
          </p>
        </div>
        <div className="relative hidden w-72 sm:block">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search within this category..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="relative mb-5 sm:hidden">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Search within this category..."
          className="pl-10"
        />
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={resetFilters}
            maxPrice={maxPrice}
            vendors={vendors}
            showCategoryFilter={false}
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
                    onChange={handleFiltersChange}
                    onReset={resetFilters}
                    maxPrice={maxPrice}
                    vendors={vendors}
                    showCategoryFilter={false}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <ProductToolbar
            resultCount={filtered.length}
            sort={sort}
            onSortChange={handleSortChange}
            view={view}
            onViewChange={setView}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try adjusting price range, vendor, or rating filters, or clear your search."
              action={
                <Button onClick={resetFilters} variant="outline">
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  view === 'grid'
                    ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3'
                    : 'flex flex-col gap-4',
                )}
              >
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} layout={view} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  document
                    .getElementById('category-products')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-8"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
