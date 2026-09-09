'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Truck, Heart, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addProductToCartQty } from '@/store/cart-feedback-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import { formatCurrency } from '@/lib/utils';
import { QuoteRequestDialog } from '@/features/catalog/components/quote-request-dialog';
import type { Product } from '@/types/catalog';

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const guard = useGuardedAction();

  const activeTier =
    [...product.bulkPricing].reverse().find((tier) => quantity >= tier.minQty) ??
    product.bulkPricing[0];
  const unitPrice = activeTier?.price ?? product.price;
  const outOfStock = product.stockStatus === 'out-of-stock';

  function handleAddToCart() {
    addProductToCartQty(product, quantity);
  }

  function handleBuyNow() {
    addProductToCartQty(product, quantity);
    guard(
      () => router.push('/checkout'),
      'Log in to place your order and checkout securely.',
    );
  }

  return (
    <div className="rounded-2xl border p-4 sm:p-6">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{formatCurrency(unitPrice)}</span>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">SKU: {product.sku}</p>

      <div className="bg-muted/60 mt-4 flex items-center gap-2 rounded-lg p-3 text-sm">
        <Truck className="text-primary h-4 w-4 shrink-0" />
        Estimated delivery in {product.deliveryEstimateDays} business days
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            className="w-14 [appearance:textfield] border-x bg-transparent text-center text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() =>
            guard(() => toggleWishlist(product.id), 'Sign in to save items to your wishlist.')
          }
          aria-label="Save to wishlist"
        >
          <Heart className={isSaved ? 'fill-destructive text-destructive h-4 w-4' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={outOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </Button>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={outOfStock}
          onClick={handleBuyNow}
        >
          <Zap className="h-4 w-4" /> Buy now
        </Button>
      </div>

      <div className="mt-3">
        <QuoteRequestDialog product={product} />
      </div>
    </div>
  );
}
