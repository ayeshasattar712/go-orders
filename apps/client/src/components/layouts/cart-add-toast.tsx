'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartFeedbackStore } from '@/store/cart-feedback-store';

export function CartAddToast() {
  const message = useCartFeedbackStore((state) => state.message);
  const pulseKey = useCartFeedbackStore((state) => state.pulseKey);
  const clear = useCartFeedbackStore((state) => state.clear);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => clear(), 2200);
    return () => window.clearTimeout(timer);
  }, [message, pulseKey, clear]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <AnimatePresence>
        {message ? (
          <motion.div
            key={pulseKey}
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
          >
            <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{message}</p>
              <p className="text-muted-foreground text-xs">Ready when you are</p>
            </div>
            <Link
              href="/cart"
              className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> View
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
