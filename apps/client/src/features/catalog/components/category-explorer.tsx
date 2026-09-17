'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  ProductToolbar,
  sortProducts,
  type SortOption,
} from '@/features/catalog/components/product-toolbar';
import {
  ProductFilters,
  applyCatalogFilters,
  catalogMaxPrice,
  countActiveFilters,
  createCatalogFilters,
  type CatalogFilters,
} from '@/features/catalog/components/product-filters';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface CategoryExplorerProps {
  products: Product[];
}

const PAGE_SIZE = 9;

export function CategoryExplorer({ products }: CategoryExplorerProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const maxPrice = useMemo(() => catalogMaxPrice(products), [products]);
  const [filters, setFilters] = useState<CatalogFilters>(() => createCatalogFilters(maxPrice));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((product) => {
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.shortDescription.toLowerCase().includes(q) ||
        product.tags.some((tag) => tag.includes(q))
      );
    });
    return sortProducts(applyCatalogFilters(result, filters), sort);
  }, [products, query, sort, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = countActiveFilters(filters, maxPrice);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  function handleFiltersChange(next: CatalogFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleFiltersReset() {
    setFilters(createCatalogFilters(maxPrice));
    setPage(1);
  }

  return (
    <div id="category-products" className="scroll-mt-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">All products in this category</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Search and sort products in this category.
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
            onReset={handleFiltersReset}
            maxPrice={maxPrice}
            showCategoryFilter={false}
            products={products}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 ? (
                    <Badge variant="secondary" className="ml-0.5 px-1.5 py-0">
                      {activeFilterCount}
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProductFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    onReset={handleFiltersReset}
                    maxPrice={maxPrice}
                    showCategoryFilter={false}
                    products={products}
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
              title="No products found"
              description="Try different filters, or a different search within this category."
            />
          ) : (
            <>
              <div
                className={cn(
                  view === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3' : 'flex flex-col gap-4',
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
