'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import { categories } from '@/lib/mock-data';
import type { Product } from '@/types/catalog';

export interface CatalogFilters {
  categorySlug: string | null;
  vendorIds: string[];
  priceRange: [number, number];
  color: string | null;
  material: string | null;
}

export const DEFAULT_PRICE_CEILING = 5000;

export function catalogMaxPrice(products: Product[], fallback = DEFAULT_PRICE_CEILING): number {
  if (!products.length) return fallback;
  return Math.max(
    fallback,
    Math.ceil(Math.max(...products.map((product) => product.price)) / 100) * 100,
  );
}

export function createCatalogFilters(
  maxPrice: number,
  categorySlug: string | null = null,
): CatalogFilters {
  return {
    categorySlug,
    vendorIds: [],
    priceRange: [0, maxPrice],
    color: null,
    material: null,
  };
}

const PRICE_PRESET_BREAKPOINTS = [0, 50, 100, 250, 500, 1000];

export interface PricePreset {
  label: string;
  min: number;
  max: number;
}

export function pricePresets(maxPrice: number): PricePreset[] {
  const breakpoints = PRICE_PRESET_BREAKPOINTS.filter((value) => value < maxPrice);
  return breakpoints.map((min, index) => {
    const max = breakpoints[index + 1] ?? maxPrice;
    const label =
      index === 0
        ? `Under ${formatCurrency(max)}`
        : index === breakpoints.length - 1
          ? `Over ${formatCurrency(min)}`
          : `${formatCurrency(min)} - ${formatCurrency(max)}`;
    return { label, min, max };
  });
}

export function catalogFacetValues(products: Product[], key: 'color' | 'material'): string[] {
  const values = new Set<string>();
  for (const product of products) {
    const value = product[key];
    if (value) values.add(value);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function applyCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  return products.filter((product) => {
    if (filters.categorySlug && product.categorySlug !== filters.categorySlug) return false;
    if (filters.vendorIds.length && !filters.vendorIds.includes(product.vendorId)) return false;
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])
      return false;
    if (filters.color && product.color !== filters.color) return false;
    if (filters.material && product.material !== filters.material) return false;
    return true;
  });
}

export function countActiveFilters(filters: CatalogFilters, maxPrice: number): number {
  let count = 0;
  if (filters.categorySlug) count += 1;
  if (filters.vendorIds.length) count += 1;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count += 1;
  if (filters.color) count += 1;
  if (filters.material) count += 1;
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
  if (filters.color) params.set('color', filters.color);
  if (filters.material) params.set('material', filters.material);
  return params.toString();
}

export function catalogFiltersFromSearchParams(
  params: { get: (key: string) => string | null; getAll: (key: string) => string[] },
  maxPrice: number,
): CatalogFilters {
  const min = Number(params.get('min'));
  const max = Number(params.get('max'));
  return {
    categorySlug: params.get('category'),
    vendorIds: params.getAll('vendor'),
    priceRange: [
      Number.isFinite(min) && min > 0 ? min : 0,
      Number.isFinite(max) && max > 0 ? max : maxPrice,
    ],
    color: params.get('color'),
    material: params.get('material'),
  };
}

interface ProductFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
  maxPrice: number;
  showCategoryFilter?: boolean;
  products?: Product[];
}

export function ProductFilters({
  filters,
  onChange,
  onReset,
  maxPrice,
  showCategoryFilter = true,
  products = [],
}: ProductFiltersProps) {
  const colorOptions = catalogFacetValues(products, 'color');
  const materialOptions = catalogFacetValues(products, 'material');
  const presets = pricePresets(maxPrice);

  const [customMin, setCustomMin] = useState(
    filters.priceRange[0] > 0 ? String(filters.priceRange[0]) : '',
  );
  const [customMax, setCustomMax] = useState(
    filters.priceRange[1] < maxPrice ? String(filters.priceRange[1]) : '',
  );

  const [syncedRange, setSyncedRange] = useState(filters.priceRange);
  if (syncedRange[0] !== filters.priceRange[0] || syncedRange[1] !== filters.priceRange[1]) {
    setSyncedRange(filters.priceRange);
    setCustomMin(filters.priceRange[0] > 0 ? String(filters.priceRange[0]) : '');
    setCustomMax(filters.priceRange[1] < maxPrice ? String(filters.priceRange[1]) : '');
  }

  function applyCustomPrice() {
    const parsedMin = customMin.trim() === '' ? 0 : Number(customMin);
    const parsedMax = customMax.trim() === '' ? maxPrice : Number(customMax);
    const min = Number.isFinite(parsedMin) ? Math.max(0, parsedMin) : 0;
    const max = Number.isFinite(parsedMax) ? Math.min(maxPrice, parsedMax) : maxPrice;
    onChange({ ...filters, priceRange: [Math.min(min, max), Math.max(min, max)] });
  }

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
        defaultValue={
          showCategoryFilter
            ? ['category', 'price', 'color', 'material']
            : ['price', 'color', 'material']
        }
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
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onChange({ ...filters, priceRange: [0, maxPrice] })}
                className={cn(
                  'hover:bg-muted block w-full rounded-md px-2 py-1.5 text-left text-sm',
                  filters.priceRange[0] === 0 &&
                    filters.priceRange[1] === maxPrice &&
                    'bg-primary/10 text-primary font-medium',
                )}
              >
                All prices
              </button>
              {presets.map((preset) => {
                const isActive =
                  filters.priceRange[0] === preset.min && filters.priceRange[1] === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange({ ...filters, priceRange: [preset.min, preset.max] })}
                    className={cn(
                      'hover:bg-muted block w-full rounded-md px-2 py-1.5 text-left text-sm',
                      isActive && 'bg-primary/10 text-primary font-medium',
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t pt-3">
              <p className="text-muted-foreground mb-2 text-xs">Or enter your own range</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min"
                  value={customMin}
                  onChange={(event) => setCustomMin(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && applyCustomPrice()}
                  className="h-8 text-sm"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max"
                  value={customMax}
                  onChange={(event) => setCustomMax(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && applyCustomPrice()}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={applyCustomPrice}
                className="mt-2 w-full"
              >
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {colorOptions.length ? (
          <AccordionItem value="color">
            <AccordionTrigger>Color</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, color: null })}
                  className={cn(
                    'hover:bg-muted rounded-full border px-3 py-1 text-xs',
                    !filters.color && 'bg-primary/10 text-primary border-primary/30 font-medium',
                  )}
                >
                  All
                </button>
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      onChange({ ...filters, color: filters.color === color ? null : color })
                    }
                    className={cn(
                      'hover:bg-muted rounded-full border px-3 py-1 text-xs',
                      filters.color === color &&
                        'bg-primary/10 text-primary border-primary/30 font-medium',
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}

        {materialOptions.length ? (
          <AccordionItem value="material">
            <AccordionTrigger>Material</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, material: null })}
                  className={cn(
                    'hover:bg-muted block w-full rounded-md px-2 py-1.5 text-left text-sm',
                    !filters.material && 'bg-primary/10 text-primary font-medium',
                  )}
                >
                  All materials
                </button>
                {materialOptions.map((material) => (
                  <button
                    key={material}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        material: filters.material === material ? null : material,
                      })
                    }
                    className={cn(
                      'hover:bg-muted block w-full rounded-md px-2 py-1.5 text-left text-sm',
                      filters.material === material && 'bg-primary/10 text-primary font-medium',
                    )}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>
    </aside>
  );
}
