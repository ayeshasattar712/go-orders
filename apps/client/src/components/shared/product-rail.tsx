'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/catalog';

interface ProductRailProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductRail({ title, description, products, viewAllHref }: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
            Shop
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {viewAllHref ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex snap-x scrollbar-none gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-[240px] min-w-0 shrink-0 snap-start sm:w-[260px]"
          />
        ))}
      </div>
    </section>
  );
}
