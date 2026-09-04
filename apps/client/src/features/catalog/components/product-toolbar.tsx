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

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface ProductToolbarProps {
  resultCount: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const sortLabels: Record<SortOption, string> = {
  relevance: 'Best match',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Highest Rated',
  newest: 'Newest Arrivals',
};

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
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Select value={sort} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-48 sm:flex-none">
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
