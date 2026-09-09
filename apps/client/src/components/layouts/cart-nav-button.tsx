'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, useCartSummary } from '@/store/cart-store';
import { useCartFeedbackStore } from '@/store/cart-feedback-store';
import { cn } from '@/lib/utils';

export function CartNavButton({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { itemCount } = useCartSummary();
  const pulseKey = useCartFeedbackStore((state) => state.pulseKey);
  const [hydrated, setHydrated] = useState(false);
  const [bump, setBump] = useState(false);
  const lastPulse = useRef(0);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useCartStore.persist.hasHydrated()) finish();
    return useCartStore.persist.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (!hydrated || pulseKey === 0 || pulseKey === lastPulse.current) return;
    lastPulse.current = pulseKey;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 650);
    return () => window.clearTimeout(timer);
  }, [pulseKey, hydrated]);

  const count = hydrated ? itemCount : 0;
  const label = count > 99 ? '99+' : String(count);

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
      className={cn(
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 hover:text-white',
        bump && 'animate-cart-bump',
        className,
      )}
    >
      <ShoppingCart className={cn('h-5 w-5', iconClassName)} />
      {count > 0 ? (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -top-0.5 -right-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5c518] px-1 text-[10px] font-bold leading-none text-zinc-900 shadow-md ring-2 ring-white/80',
            bump && 'animate-cart-badge-pop',
          )}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
