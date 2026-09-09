'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductToolbar, sortProducts, type SortOption } from '@/features/catalog/components/product-toolbar';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { useProducts } from '@/services/queries';
import { cn } from '@/lib/utils';

export function ProductListing() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  const { data: products = [], isPending, isError } = useProducts();
  const [sort, setSort] = useState<SortOption>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'new' || sortParam === 'newest') setSort('newest');
    if (sortParam === 'price-asc') setSort('price-asc');
    if (sortParam === 'price-desc') setSort('price-desc');
    if (sortParam === 'rating') setSort('rating');
  }, [searchParams]);

  const filtered = useMemo(() => {
    const searched = products.filter((product) => {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) || product.tags.some((tag) => tag.includes(query))
      );
    });
    return sortProducts(searched, sort);
  }, [sort, query, products]);

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
          description="Try a different search, or browse the full catalog."
        />
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              : 'flex flex-col gap-4',
          )}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} layout={view} />
          ))}
        </div>
      )}
    </div>
  );
}
