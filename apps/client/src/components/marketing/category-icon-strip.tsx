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
    <section className="bg-background">
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
                  'relative h-[72px] w-[72px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200',
                  selected
                    ? 'border-primary ring-primary/30 scale-105 ring-4'
                    : 'border-border group-hover:border-primary/40 group-hover:scale-105',
                )}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-contain p-2"
                  sizes="72px"
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
