'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/catalog';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function FlashSaleSection({ products }: { products: Product[] }) {
  const [remaining, setRemaining] = useState(8 * 60 * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const spotlight = products[0];

  return (
    <section className="bg-navy-glow text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.22em] uppercase">
            Limited time offer
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Up to 50% off
          </h2>
          <p className="mt-3 max-w-md text-white/65">
            Flash deals on office, IT, and pantry staples. Timer resets tonight.
          </p>
          <div className="mt-6 flex items-center gap-2 font-mono text-lg font-bold">
            <span className="rounded-lg bg-white/10 px-3 py-2">{pad(hours)}</span>
            <span className="text-white/40">:</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">{pad(minutes)}</span>
            <span className="text-white/40">:</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">{pad(seconds)}</span>
          </div>
          <Button asChild size="lg" className="mt-8">
            <Link href="/deals">
              Grab the deal <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-[12%] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute inset-[22%] rounded-full border border-primary/30" />
          {spotlight ? (
            <Link href={`/products/${spotlight.slug}`} className="relative block h-full">
              <Image
                src={spotlight.images[0] ?? ''}
                alt={spotlight.name}
                fill
                className="object-contain drop-shadow-[0_20px_60px_rgba(37,99,235,0.4)]"
                sizes="400px"
              />
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                {spotlight.name.split(' ').slice(0, 3).join(' ')} · {formatCurrency(spotlight.price)}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
