'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { categories, getCategoryChildren, getProductsByCategory } from '@/lib/mock-data';
import { CategoryIcon } from '@/components/shared/category-icon';
import { cn, formatCurrency } from '@/lib/utils';

const banners = [
  {
    href: '/deals',
    title: 'Mega Sale',
    subtitle: 'Up to 50% off everyday essentials',
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop',
  },
  {
    href: '/categories/it-equipment',
    title: 'Tech week',
    subtitle: 'Laptops, monitors, and gear for less',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
  },
  {
    href: '/categories/grocery-pantry',
    title: 'Pantry haul',
    subtitle: 'Stock up on grocery & breakroom staples',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop',
  },
];

const promoTiles = [
  {
    href: '/deals',
    title: 'Flash Sale',
    caption: 'Ends tonight',
    image:
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800&auto=format&fit=crop',
  },
  {
    href: '/vendors',
    title: 'GoOrder Mall',
    caption: 'Official stores',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  },
];

export function MarketplaceHero() {
  const [index, setIndex] = useState(0);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const active = banners[index]!;
  const hoveredCategory = categories.find((category) => category.slug === hoveredSlug);
  const hoveredChildren = hoveredSlug ? getCategoryChildren(hoveredSlug) : [];
  const hoveredProducts = hoveredSlug ? getProductsByCategory(hoveredSlug, 4) : [];

  function openMenu(slug: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setHoveredSlug(slug);
  }

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setHoveredSlug(null), 140);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <section className="relative z-20 mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="grid gap-3 lg:grid-cols-[220px_1fr_200px]">
        <nav
          className="bg-card relative hidden rounded-sm shadow-sm lg:block"
          onMouseLeave={scheduleClose}
        >
          {categories
            .filter((category) => category.status === 'active')
            .map((category) => {
              const isOpen = hoveredSlug === category.slug;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onMouseEnter={() => openMenu(category.slug)}
                  onPointerEnter={() => openMenu(category.slug)}
                  onFocus={() => openMenu(category.slug)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2.5 text-sm',
                    isOpen ? 'bg-primary/5 text-primary' : 'hover:bg-primary/5 hover:text-primary',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CategoryIcon name={category.icon} className="text-primary h-4 w-4 shrink-0" />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      isOpen ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                </Link>
              );
            })}
          <Link
            href="/categories"
            className="text-primary hover:bg-primary/5 block border-t px-3 py-2.5 text-sm font-medium"
            onMouseEnter={scheduleClose}
          >
            All categories
          </Link>

          {hoveredCategory ? (
            <div
              className="bg-card absolute top-0 left-full z-50 ml-px flex min-h-full w-[420px] rounded-sm border shadow-xl"
              onMouseEnter={() => openMenu(hoveredCategory.slug)}
              onPointerEnter={() => openMenu(hoveredCategory.slug)}
            >
              <div className="min-w-0 flex-1 p-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {hoveredCategory.name}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {hoveredChildren.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/products?category=${hoveredCategory.slug}&q=${encodeURIComponent(child.name)}`}
                      className="hover:text-primary hover:bg-primary/5 rounded-md px-2 py-1.5 text-sm"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/categories/${hoveredCategory.slug}`}
                  className="text-primary mt-3 inline-flex items-center gap-1 px-2 text-sm font-medium hover:underline"
                >
                  Shop all {hoveredCategory.name}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {hoveredProducts.length ? (
                <div className="w-[180px] shrink-0 border-l p-3">
                  <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
                    Popular
                  </p>
                  <div className="space-y-2">
                    {hoveredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="hover:bg-muted flex gap-2 rounded-md p-1.5"
                      >
                        <span className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.images[0] ?? ''}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-[11px] leading-tight">
                            {product.name}
                          </span>
                          <span className="text-primary text-xs font-semibold">
                            {formatCurrency(product.price)}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <Link
          href={active.href}
          className="bg-card relative block min-h-[180px] overflow-hidden rounded-sm shadow-sm sm:min-h-[280px]"
        >
          <Image
            src={active.image}
            alt={active.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
          <div className="absolute bottom-5 left-5 max-w-md text-white">
            <p className="text-xs font-semibold tracking-widest uppercase">{active.title}</p>
            <p className="mt-1 text-2xl font-bold sm:text-3xl">{active.subtitle}</p>
          </div>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, bannerIndex) => (
              <button
                key={banner.href}
                type="button"
                aria-label={`Show ${banner.title}`}
                onClick={(event) => {
                  event.preventDefault();
                  setIndex(bannerIndex);
                }}
                className={cn(
                  'h-1.5 w-5 rounded-full bg-white/50',
                  bannerIndex === index && 'bg-white',
                )}
              />
            ))}
          </div>
        </Link>

        <div className="hidden flex-col gap-3 lg:flex">
          {promoTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="bg-card relative min-h-[134px] flex-1 overflow-hidden rounded-sm shadow-sm"
            >
              <Image
                src={tile.image}
                alt={tile.title}
                fill
                className="object-cover"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="font-bold">{tile.title}</p>
                <p className="text-xs text-white/80">{tile.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
