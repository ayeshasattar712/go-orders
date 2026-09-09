'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { homeCategoryTiles } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const arrowBtnClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-800 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-[0_12px_24px_-12px_hsl(262_83%_58%/0.55)] active:translate-y-0';

export function CategoryProductLine() {
  const scroller = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ left: 0, width: 35 });

  function updateProgress() {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    const ratio = max > 0 ? node.scrollLeft / max : 0;
    const width = Math.max(22, (node.clientWidth / node.scrollWidth) * 100);
    setProgress({ left: ratio * (100 - width), width });
  }

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    updateProgress();
    node.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      node.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  function scrollByDir(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f7fc_0%,#ffffff_55%,#ffffff_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,hsl(262_83%_58%/0.08),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
              Browse
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Shop by category
            </h2>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              Jump into the aisle you need — furniture, IT, supplies, and more.
            </p>
          </div>
          <Link
            href="/categories"
            className="text-primary hidden items-center gap-1 text-sm font-semibold transition-colors hover:underline sm:inline-flex"
          >
            View all categories
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className={arrowBtnClass}
            aria-label="Previous categories"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <div
            ref={scroller}
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth py-2 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
          >
            {homeCategoryTiles.map((item) => (
              <Link
                key={`${item.parentSlug}-${item.sub}`}
                href={`/categories/${item.parentSlug}?sub=${item.sub}`}
                className="group flex w-[118px] shrink-0 flex-col items-center sm:w-[132px]"
              >
                <span
                  className={cn(
                    'relative mb-2.5 flex h-[108px] w-[108px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/90 bg-white',
                    'shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]',
                    'transition-all duration-300 ease-out',
                    'group-hover:-translate-y-1.5 group-hover:border-primary/45',
                    'group-hover:shadow-[0_22px_40px_-20px_hsl(262_83%_58%/0.45)]',
                    'group-hover:ring-4 group-hover:ring-primary/15',
                    'sm:h-[120px] sm:w-[120px]',
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(262_83%_58%/0.08),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover p-0 transition-transform duration-500 ease-out group-hover:scale-110"
                    sizes="120px"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </span>
                <span className="line-clamp-2 min-h-[2.5em] px-1 text-center text-[13px] leading-snug font-semibold text-zinc-800 transition-colors duration-200 group-hover:text-primary sm:text-sm">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className={arrowBtnClass}
            aria-label="Next categories"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-2 flex flex-col items-center gap-3">
          <div className="mx-auto h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-zinc-200/90">
            <div
              className="bg-primary h-1.5 rounded-full transition-[margin,width] duration-200"
              style={{ width: `${progress.width}%`, marginLeft: `${progress.left}%` }}
            />
          </div>
          <Link
            href="/categories"
            className="text-primary text-sm font-semibold hover:underline sm:hidden"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
