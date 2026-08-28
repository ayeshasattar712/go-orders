'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CatalogImageOption } from '@/lib/catalog/category-images';

export function ImagePicker({
  options,
  value,
  onChange,
}: {
  options: CatalogImageOption[];
  value: string;
  onChange: (url: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.url}
          type="button"
          onClick={() => onChange(option.url)}
          className={cn(
            'relative overflow-hidden rounded-md border',
            value === option.url ? 'border-primary ring-primary ring-2' : 'border-border',
          )}
        >
          <span className="relative block aspect-video">
            <Image
              src={option.url}
              alt={option.label}
              fill
              className="object-cover"
              sizes="160px"
            />
          </span>
          <span className="bg-background/90 absolute inset-x-0 bottom-0 truncate px-1 py-0.5 text-[10px]">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
