'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';

const slides = categories.filter((category) => category.status === 'active').slice(0, 3);

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  function go(direction: -1 | 1) {
    setIndex((current) => (current + direction + slides.length) % slides.length);
  }

  const active = slides[index];
  if (!active) return null;

  return (
    <section className="relative h-[420px] overflow-hidden sm:h-[480px] lg:h-[560px]">
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Image
            src={slide.image}
            alt={slide.name}
            fill
            priority={slideIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6">
        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
          Not Just {active.name}.
        </h1>
        <p className="mt-4 max-w-lg text-sm text-white/80 sm:text-base">{active.description}</p>
        <Button asChild size="lg" className="mt-7">
          <Link href={`/categories/${active.slug}`}>Shop Now</Link>
        </Button>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 sm:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 sm:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              slideIndex === index ? 'bg-primary w-6' : 'w-1.5 bg-white/50',
            )}
          />
        ))}
      </div>
    </section>
  );
}
