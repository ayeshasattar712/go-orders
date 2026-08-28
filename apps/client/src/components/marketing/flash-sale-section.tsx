'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bolt } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
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

  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="bg-card rounded-sm p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-primary flex items-center gap-1.5 text-lg font-black tracking-tight italic">
              <Bolt className="h-5 w-5 fill-current" /> Flash Sale
            </h2>
            <div className="flex items-center gap-1 font-mono text-sm font-bold">
              <span className="bg-foreground text-background rounded-sm px-1.5 py-0.5">
                {pad(hours)}
              </span>
              <span>:</span>
              <span className="bg-foreground text-background rounded-sm px-1.5 py-0.5">
                {pad(minutes)}
              </span>
              <span>:</span>
              <span className="bg-foreground text-background rounded-sm px-1.5 py-0.5">
                {pad(seconds)}
              </span>
            </div>
          </div>
          <Link href="/deals" className="text-primary text-sm font-medium hover:underline">
            Shop more
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
