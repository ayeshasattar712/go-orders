'use client';

import { Star } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categories } from '@/lib/mock-data';
import type { Product } from '@/types/catalog';

export interface CatalogFilters {
  categorySlug: string | null;
  vendorIds: string[];
  priceRange: [number, number];
  minRating: number | null;
  inStockOnly: boolean;
  bulkOnly: boolean;
}

export const DEFAULT_PRICE_CEILING = 5000;

export function catalogMaxPrice(products: Product[], fallback = DEFAULT_PRICE_CEILING): number {
  if (!products.length) return fallback;
  return Math.max(fallback, Math.ceil(Math.max(...products.map((product) => product.price)) / 100) * 100);
}

export function createCatalogFilters(
  maxPrice: number,
  categorySlug: string | null = null,
): CatalogFilters {
  return {
    categorySlug,
    vendorIds: [],
    priceRange: [0, maxPrice],
    minRating: null,
    inStockOnly: false,
    bulkOnly: false,
  };
}

export function applyCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter((product) => {
    if (filters.categorySlug && product.categorySlug !== filters.categorySlug) return false;
    if (filters.vendorIds.length && !filters.vendorIds.includes(product.vendorId)) return false;
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
    if (filters.minRating && product.rating < filters.minRating) return false;
    if (filters.inStockOnly && product.stockStatus === 'out-of-stock') return false;
    if (filters.bulkOnly && product.bulkPricing.length < 2) return false;
    return true;
  });
}

export function countActiveFilters(filters: CatalogFilters, maxPrice: number): number {
  let count = 0;
  if (filters.categorySlug) count += 1;
  if (filters.vendorIds.length) count += 1;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count += 1;
  if (filters.minRating) count += 1;
  if (filters.inStockOnly) count += 1;
  if (filters.bulkOnly) count += 1;
  return count;
}

export function catalogFiltersToQuery(filters: CatalogFilters, maxPrice: number): string {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set('category', filters.categorySlug);
  if (filters.vendorIds.length) {
    for (const vendorId of filters.vendorIds) params.append('vendor', vendorId);
  }
  if (filters.priceRange[0] > 0) params.set('min', String(filters.priceRange[0]));
  if (filters.priceRange[1] < maxPrice) params.set('max', String(filters.priceRange[1]));
  if (filters.minRating) params.set('rating', String(filters.minRating));
  if (filters.inStockOnly) params.set('inStock', '1');
  if (filters.bulkOnly) params.set('bulk', '1');
  return params.toString();
}

export function catalogFiltersFromSearchParams(
  params: { get: (key: string) => string | null; getAll: (key: string) => string[] },
  maxPrice: number,
): CatalogFilters {
  const min = Number(params.get('min'));
  const max = Number(params.get('max'));
  const rating = Number(params.get('rating'));
  return {
    categorySlug: params.get('category'),
    vendorIds: params.getAll('vendor'),
    priceRange: [
      Number.isFinite(min) && min > 0 ? min : 0,
      Number.isFinite(max) && max > 0 ? max : maxPrice,
    ],
    minRating: Number.isFinite(rating) && rating > 0 ? rating : null,
    inStockOnly: params.get('inStock') === '1',
    bulkOnly: params.get('bulk') === '1',
  };
}

interface ProductFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
  maxPrice: number;
  showCategoryFilter?: boolean;
}

export function ProductFilters({
  filters,
  onChange,
  onReset,
  maxPrice,
  showCategoryFilter = true,
}: ProductFiltersProps) {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={showCategoryFilter ? ['category', 'price', 'rating'] : ['price', 'rating']}
      >
        {showCategoryFilter ? (
          <AccordionItem value="category">
            <AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, categorySlug: null })}
                  className={cn(
                    'hover:bg-muted block w-full rounded-md px-2 py-1.5 text-left text-sm',
                    !filters.categorySlug && 'bg-primary/10 text-primary font-medium',
                  )}
                >
                  All categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onChange({ ...filters, categorySlug: category.slug })}
                    className={cn(
                      'hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm',
                      filters.categorySlug === category.slug &&
                        'bg-primary/10 text-primary font-medium',
                    )}
                  >
                    {category.name}
                    <span className="text-muted-foreground text-xs">{category.productCount}</span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}

        <AccordionItem value="price">
          <AccordionTrigger>Price range</AccordionTrigger>
          <AccordionContent>
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) =>
                onChange({ ...filters, priceRange: value as [number, number] })
              }
            />
            <div className="text-muted-foreground mt-3 flex items-center justify-between text-sm">
              <span>{formatCurrency(filters.priceRange[0])}</span>
              <span>{formatCurrency(filters.priceRange[1])}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Customer rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5">
              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      minRating: filters.minRating === rating ? null : rating,
                    })
                  }
                  className={cn(
                    'hover:bg-muted flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm',
                    filters.minRating === rating && 'bg-primary/10 text-primary',
                  )}
                >
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          'h-3.5 w-3.5',
                          index < rating ? 'fill-warning text-warning' : 'fill-muted text-muted',
                        )}
                      />
                    ))}
                  </span>
                  & up
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
