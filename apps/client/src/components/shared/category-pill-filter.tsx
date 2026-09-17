'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CategoryIcon } from '@/components/shared/category-icon';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

interface CategoryPillFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  className?: string;
}

export function CategoryPillFilter({
  categories,
  selected,
  onSelect,
  className,
}: CategoryPillFilterProps) {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  return (
    <div className={cn('flex scrollbar-none items-center gap-2 overflow-x-auto pb-2', className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
          !selected
            ? 'bg-foreground text-background'
            : 'border-border bg-card text-foreground hover:bg-muted border',
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.slug)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-sm font-medium transition-colors',
            selected === category.slug
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted',
          )}
        >
          <span className="bg-muted relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {brokenImages.has(category.id) ? (
              <CategoryIcon name={category.icon} className="text-muted-foreground h-3.5 w-3.5" />
            ) : (
              <Image
                src={category.image}
                alt=""
                fill
                className="object-cover"
                sizes="28px"
                onError={() => setBrokenImages((prev) => new Set(prev).add(category.id))}
              />
            )}
          </span>
          {category.name}
        </button>
      ))}
    </div>
  );
}
