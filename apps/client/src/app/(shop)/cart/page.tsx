'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CartItemRow } from '@/features/cart/components/cart-item-row';
import { useCartStore } from '@/store/cart-store';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import { formatCurrency } from '@/lib/utils';

const TAX_RATE = 0.0825;
const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING = 24.99;
const VALID_COUPON = 'GOORDER10';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const guardedAction = useGuardedAction();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const activeItems = items.filter((item) => !item.savedForLater);
  const savedItems = items.filter((item) => item.savedForLater);

  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponCode ? subtotal * 0.1 : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;

  function handleApplyCoupon() {
    if (couponInput.trim().toUpperCase() === VALID_COUPON) {
      applyCoupon(VALID_COUPON);
      setCouponError(null);
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Browse the marketplace to find products for your business."
          action={
            <Button asChild>
              <Link href="/products">Start shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tight">
        <ShoppingBag className="h-6 w-6" /> Shopping cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border p-5">
            <h2 className="mb-1 font-semibold">
              {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} in cart
            </h2>
            {activeItems.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>

          {savedItems.length > 0 ? (
            <div className="mt-6 rounded-2xl border p-5">
              <h2 className="mb-1 font-semibold">Saved for later ({savedItems.length})</h2>
              {savedItems.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border p-5">
            <h2 className="mb-4 font-semibold">Order summary</h2>

            <div className="space-y-1.5">
              <label htmlFor="coupon" className="text-muted-foreground text-xs font-medium">
                Coupon code
              </label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="Enter code (try GOORDER10)"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  disabled={Boolean(couponCode)}
                />
                {couponCode ? (
                  <Button type="button" variant="outline" onClick={removeCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                    <Tag className="h-4 w-4" /> Apply
                  </Button>
                )}
              </div>
              {couponError ? <p className="text-destructive text-xs">{couponError}</p> : null}
              {couponCode ? (
                <p className="text-success text-xs">Coupon {couponCode} applied — 10% off</p>
              ) : null}
            </div>

            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="text-success flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated tax (8.25%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 ? (
              <p className="bg-muted/60 text-muted-foreground mt-3 rounded-lg p-2.5 text-xs">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            ) : null}

            <Button
              size="lg"
              className="mt-5 w-full"
              disabled={activeItems.length === 0}
              onClick={() =>
                guardedAction(
                  () => router.push('/checkout'),
                  'Log in to place your order and checkout securely.',
                )
              }
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
