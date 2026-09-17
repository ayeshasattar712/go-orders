'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import {
  ProductToolbar,
  sortProducts,
  type SortOption,
} from '@/features/catalog/components/product-toolbar';
import {
  ProductFilters,
  applyCatalogFilters,
  catalogFiltersFromSearchParams,
  catalogFiltersToQuery,
  catalogMaxPrice,
  countActiveFilters,
  createCatalogFilters,
  type CatalogFilters,
} from '@/features/catalog/components/product-filters';
import { ProductCard } from '@/components/shared/product-card';
import { CategoryPillFilter } from '@/components/shared/category-pill-filter';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProducts } from '@/services/queries';
import { categories } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function ProductListing() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  const { data: products = [], isPending, isError } = useProducts();
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const maxPrice = useMemo(() => catalogMaxPrice(products), [products]);
  const [filters, setFilters] = useState<CatalogFilters>(() => createCatalogFilters(maxPrice));
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    if (filtersReady || products.length === 0) return;
    // Syncs filter state from the URL once product data (and thus maxPrice) is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(catalogFiltersFromSearchParams(searchParams, maxPrice));
    setFiltersReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, maxPrice, filtersReady]);

  useEffect(() => {
    // Syncs sort state from the URL's `sort` query param.
    const sortParam = searchParams.get('sort');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sortParam === 'new' || sortParam === 'newest') setSort('newest');
    if (sortParam === 'price-asc') setSort('price-asc');
    if (sortParam === 'price-desc') setSort('price-desc');
    if (sortParam === 'rating') setSort('rating');
  }, [searchParams]);

  function updateFilters(next: CatalogFilters) {
    setFilters(next);
    const params = new URLSearchParams(catalogFiltersToQuery(next, maxPrice));
    if (query) params.set('q', query);
    if (sort !== 'relevance') params.set('sort', sort);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function resetFilters() {
    updateFilters(createCatalogFilters(maxPrice));
  }

  const filtered = useMemo(() => {
    const searched = products.filter((product) => {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.includes(query))
      );
    });
    return sortProducts(applyCatalogFilters(searched, filters), sort);
  }, [sort, query, products, filters]);

  if (isPending) {
    return <Loader label="Loading products..." />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn't load products"
        description="Something went wrong fetching the catalog. Please try again."
      />
    );
  }

  const activeFilterCount = countActiveFilters(filters, maxPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {query ? `Results for "${query}"` : 'Shop all products'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse office furniture, IT equipment, grocery, cleaning, and electrical supplies.
        </p>
      </div>

      <CategoryPillFilter
        categories={categories}
        selected={filters.categorySlug}
        onSelect={(categorySlug) => updateFilters({ ...filters, categorySlug })}
        className="mb-5"
      />

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
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
                    onChange={updateFilters}
                    onReset={resetFilters}
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
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try different filters, or browse the full catalog."
            />
          ) : (
            <div
              className={cn(
                view === 'grid'
                  ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4'
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
