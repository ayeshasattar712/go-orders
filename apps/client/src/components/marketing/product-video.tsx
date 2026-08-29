'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { categories, getBestSellers, getTrendingProducts } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Product } from '@/types/catalog';

function useProductFilm(products: Product[], intervalMs = 2800) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % products.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [products.length, intervalMs]);

  return products[index] ?? products[0];
}

function FilmFrame({ products, className }: { products: Product[]; className?: string }) {
  const active = useProductFilm(products);

  if (!active) return null;

  return (
    <div className={className}>
      {products.map((product) => (
        <Image
          key={product.id}
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-700 ${
            product.id === active.id ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="360px"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute right-3 bottom-3 left-3">
        <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Now showing</p>
        <p className="font-display line-clamp-1 text-sm font-semibold text-white">{active.name}</p>
        <p className="text-primary text-xs font-semibold">{formatCurrency(active.price)}</p>
      </div>
    </div>
  );
}

export function PlayCatalogVideoButton() {
  const products = [...getTrendingProducts(6), ...getBestSellers(6)].filter(
    (product, index, list) => list.findIndex((item) => item.id === product.id) === index,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
          Play video
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-hidden border-white/10 bg-navy p-0 text-white sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>GoOrder product film</DialogTitle>
          <DialogDescription>Watch featured catalog products in motion.</DialogDescription>
        </DialogHeader>
        <FilmFrame products={products} className="relative aspect-video w-full bg-black" />
      </DialogContent>
    </Dialog>
  );
}

export function ProductVideoShowcase() {
  const filmProducts = getTrendingProducts(8);
  const categoryCards = categories.filter((category) => category.status === 'active');

  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-primary mb-2 text-xs font-semibold tracking-[0.22em] uppercase">
          Shop by category
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          See our catalog in motion
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
          One high-quality look at every department — furniture, pantry, IT, supplies, cleaning,
          and electrical.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-4">
          <div className="flex w-full shrink-0 sm:w-[240px] lg:w-[300px]">
            <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
              <FilmFrame products={filmProducts} className="absolute inset-0 h-full w-full" />
              <div className="absolute top-3 left-3 z-10">
                <PlayCatalogVideoButton />
              </div>
            </div>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10"
              >
                <span className="relative block aspect-[5/4] h-full min-h-[140px] bg-white">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="220px"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                </span>
                <span className="absolute right-2.5 bottom-2.5 left-2.5">
                  <span className="block text-sm font-medium text-white">{category.name}</span>
                  <span className="text-primary mt-0.5 block text-xs font-medium">
                    {category.productCount.toLocaleString()} products
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Button asChild size="lg" className="mt-6 w-fit">
          <Link href="/categories">View all categories</Link>
        </Button>
      </div>
    </section>
  );
}
