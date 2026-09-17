'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  SortBySelect,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/types/catalog';

export function useCatalogSection(products: Product[]) {
  const [sort, setSort] = useState<SortOption>('relevance');
  const maxPrice = useMemo(() => catalogMaxPrice(products), [products]);
  const [filters, setFilters] = useState<CatalogFilters>(() => createCatalogFilters(maxPrice));
  const visible = useMemo(
    () => sortProducts(applyCatalogFilters(products, filters), sort),
    [products, sort, filters],
  );
  return {
    sort,
    setSort,
    filters,
    setFilters,
    resetFilters: () => setFilters(createCatalogFilters(maxPrice)),
    maxPrice,
    allProducts: products,
    visible,
  };
}

export function CatalogSectionControls({
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  onFiltersReset,
  maxPrice,
  products,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  onFiltersReset: () => void;
  maxPrice: number;
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters, maxPrice);

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
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
              onChange={onFiltersChange}
              onReset={onFiltersReset}
              maxPrice={maxPrice}
              products={products}
            />
          </div>
        </SheetContent>
      </Sheet>
      <SortBySelect sort={sort} onSortChange={onSortChange} />
    </div>
  );
}
