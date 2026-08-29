'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';

export function CategoryIconStrip() {
  const active = categories.filter((category) => category.status === 'active');
  const [hovered, setHovered] = useState(active[0]?.slug ?? '');

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-8 sm:px-6 lg:justify-center">
        {active.map((category) => {
          const selected = hovered === category.slug;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              onMouseEnter={() => setHovered(category.slug)}
              className="group flex min-w-[96px] flex-col items-center gap-2.5"
            >
              <span
                className={cn(
                  'relative h-[72px] w-[72px] overflow-hidden rounded-full border-2 shadow-sm transition-all duration-200',
                  selected
                    ? 'border-primary ring-primary/30 scale-105 ring-4'
                    : 'border-transparent group-hover:scale-105 group-hover:border-primary/40',
                )}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="72px"
                />
                <span
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black/35 to-transparent transition-opacity',
                    selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                  )}
                />
              </span>
              <span
                className={cn(
                  'max-w-[92px] text-center text-xs leading-tight font-medium',
                  selected ? 'text-primary' : 'text-foreground',
                )}
              >
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
