'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export const sortLabels: Record<SortOption, string> = {
  relevance: 'Best match',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Highest Rated',
  newest: 'Newest Arrivals',
};

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  return [...products].sort((a, b) => {
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
}

export function SortBySelect({
  sort,
  onSortChange,
  className,
}: {
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <span className="text-muted-foreground hidden shrink-0 text-sm sm:inline">Sort by</span>
      <Select value={sort} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="min-w-0 w-44 sm:w-52" aria-label="Sort by">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(sortLabels) as SortOption[]).map((key) => (
            <SelectItem key={key} value={key}>
              {sortLabels[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ProductToolbarProps {
  resultCount: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ProductToolbar({
  resultCount,
  sort,
  onSortChange,
  view,
  onViewChange,
}: ProductToolbarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">{resultCount}</span> products found
      </p>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <SortBySelect sort={sort} onSortChange={onSortChange} />

        <div className="flex items-center rounded-lg border p-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn('h-8 w-8', view === 'grid' && 'bg-muted')}
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn('h-8 w-8', view === 'list' && 'bg-muted')}
            onClick={() => onViewChange('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
