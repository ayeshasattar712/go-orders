'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addProductToCart } from '@/store/cart-feedback-store';
import { getProductsByCategory } from '@/lib/mock-data';
import type { Product } from '@/types/catalog';

function MustBuySlide() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a2470]">
      <Image
        src="/images/marketing/must-buy-collage.png"
        alt="Workplace furniture, IT, and everyday supplies"
        fill
        priority
        className="object-contain object-right"
        sizes="(max-width: 1280px) 100vw, 1100px"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[48%] bg-[#0a2470]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-[42%] w-[28%] bg-gradient-to-r from-[#0a2470] via-[#0a2470]/80 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex h-full w-[42%] flex-col justify-center px-5 sm:w-[40%] sm:px-8 lg:px-10">
        <h1 className="max-w-[12ch] text-2xl leading-tight font-extrabold text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] sm:text-4xl">
          Buy Better for Business
        </h1>
        <Button
          asChild
          className="mt-5 h-10 w-fit rounded-full bg-[#f5c518] px-7 text-base font-bold text-[#9a3412] shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-yellow-300 sm:h-11"
        >
          <Link href="/products">Shop now</Link>
        </Button>
      </div>
    </div>
  );
}

function MegaDealsSlide({ onAdd }: { onAdd: (product: Product) => void }) {
  const featured = useMemo(() => getProductsByCategory('office-furniture')[0], []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#2e1065]">
      <Image
        src="/images/marketing/mega-deals-podium-cluster.png"
        alt="Featured grocery, electronics, and personal care products"
        fill
        className="object-cover object-[center_right]"
        sizes="(max-width: 1280px) 100vw, 1100px"
      />

      <div className="relative z-10 flex h-full w-[48%] flex-col justify-center px-5 sm:w-[44%] sm:px-10 lg:px-12">
        <p className="mb-2 w-fit rounded-md bg-white px-3 py-1 text-[10px] font-extrabold tracking-wide text-orange-500 uppercase sm:text-xs">
          9.9 Anniversary Sale
        </p>
        <h1 className="font-display text-3xl leading-none font-black tracking-tight text-yellow-300 sm:text-5xl">
          MEGA DEALS
        </h1>
        <p className="mt-1 text-lg font-extrabold tracking-tight text-white uppercase sm:text-2xl">
          Up to 80% off
        </p>
        {featured ? (
          <Button
            type="button"
            size="sm"
            className="mt-5 h-10 w-fit rounded-full bg-white px-8 text-base font-bold text-orange-500 hover:bg-white/90 sm:h-11"
            onClick={() => onAdd(featured)}
          >
            Add to Cart
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MartSlide() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#123d28]">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden>
        <pattern id="mart-icons" width="120" height="90" patternUnits="userSpaceOnUse">
          <path d="M18 28h20l4 22H22z" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="26" cy="56" r="3" fill="white" />
          <circle cx="38" cy="56" r="3" fill="white" />
          <rect x="70" y="22" width="14" height="28" rx="7" fill="none" stroke="white" strokeWidth="2" />
          <path d="M92 48c8-10 18-8 22 0" fill="none" stroke="white" strokeWidth="2" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#mart-icons)" />
      </svg>

      <div className="relative z-10 flex h-full w-[46%] flex-col justify-center px-5 sm:w-[42%] sm:px-10 lg:px-12">
        <p className="font-display text-3xl leading-none font-bold tracking-tight text-white sm:text-5xl">
          GOORDER
        </p>
        <p className="font-display text-4xl leading-none font-bold tracking-tight text-yellow-300 sm:text-6xl">
          MART
        </p>
        <p className="mt-2 text-sm font-semibold tracking-[0.18em] text-white uppercase sm:text-base">
          Grocery &amp; cleaning
        </p>
        <Button
          asChild
          className="mt-5 h-10 w-fit rounded-full bg-yellow-300 px-7 font-bold text-zinc-900 hover:bg-yellow-200 sm:h-11"
        >
          <Link href="/categories/grocery-pantry">Shop Now</Link>
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 w-[58%] sm:w-[56%]">
        <Image
          src="/images/marketing/goorder-everyday-essentials.png"
          alt="Everyday grocery and cleaning products"
          fill
          priority
          className="object-contain object-right"
          sizes="(max-width: 1024px) 60vw, 640px"
        />
      </div>
    </div>
  );
}

export function FeaturedProductsBanner() {
  const [index, setIndex] = useState(0);
  const slides = 3;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  function go(direction: -1 | 1) {
    setIndex((current) => (current + direction + slides) % slides);
  }

  return (
    <section className="bg-[#f5f5f5] px-3 py-3 sm:px-4">
      <div className="relative mx-auto h-[280px] max-w-7xl overflow-hidden rounded-xl sm:h-[340px] lg:h-[380px]">
        {index === 0 ? (
          <MustBuySlide />
        ) : index === 1 ? (
          <MegaDealsSlide onAdd={(product) => addProductToCart(product)} />
        ) : (
          <MartSlide />
        )}

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute top-1/2 left-2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute top-1/2 right-2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: slides }).map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={
                slideIndex === index
                  ? 'h-1.5 w-1.5 rounded-full bg-white'
                  : 'h-1.5 w-1.5 rounded-full bg-white/40'
              }
              aria-label={`Slide ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
