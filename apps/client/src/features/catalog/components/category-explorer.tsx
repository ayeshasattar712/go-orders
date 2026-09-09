'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductToolbar, sortProducts, type SortOption } from '@/features/catalog/components/product-toolbar';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
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
    return sortProducts(result, sort);
  }, [products, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  return (
    <div id="category-products" className="scroll-mt-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">All products in this category</h2>
          <p className="text-muted-foreground mt-1 text-sm">Search and sort products in this category.</p>
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
          description="Try a different search within this category."
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
              document.getElementById('category-products')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
}
