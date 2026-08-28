'use client';

import { Star } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categories, vendors as allVendors } from '@/lib/mock-data';
import type { Vendor } from '@/types/catalog';

export interface CatalogFilters {
  categorySlug: string | null;
  vendorIds: string[];
  priceRange: [number, number];
  minRating: number | null;
  inStockOnly: boolean;
  bulkOnly: boolean;
}

interface ProductFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
  maxPrice: number;
  vendors?: Vendor[];
  showCategoryFilter?: boolean;
}

export function ProductFilters({
  filters,
  onChange,
  onReset,
  maxPrice,
  vendors = allVendors,
  showCategoryFilter = true,
}: ProductFiltersProps) {
  function toggleVendor(vendorId: string) {
    const exists = filters.vendorIds.includes(vendorId);
    onChange({
      ...filters,
      vendorIds: exists
        ? filters.vendorIds.filter((id) => id !== vendorId)
        : [...filters.vendorIds, vendorId],
    });
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
            ? ['category', 'price', 'vendor', 'rating', 'availability']
            : ['price', 'vendor', 'rating', 'availability']
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

        <AccordionItem value="vendor">
          <AccordionTrigger>Vendor</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {vendors.map((vendor) => (
                <label key={vendor.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded border"
                    checked={filters.vendorIds.includes(vendor.id)}
                    onChange={() => toggleVendor(vendor.id)}
                  />
                  {vendor.name}
                </label>
              ))}
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

        <AccordionItem value="availability">
          <AccordionTrigger>Availability & purchase type</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="in-stock" className="text-sm font-normal">
                In stock only
              </Label>
              <Switch
                id="in-stock"
                checked={filters.inStockOnly}
                onCheckedChange={(checked) => onChange({ ...filters, inStockOnly: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-only" className="text-sm font-normal">
                Bulk pricing available
              </Label>
              <Switch
                id="bulk-only"
                checked={filters.bulkOnly}
                onCheckedChange={(checked) => onChange({ ...filters, bulkOnly: checked })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
