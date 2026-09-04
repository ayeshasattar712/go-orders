'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Truck, Heart, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import { formatCurrency } from '@/lib/utils';
import { QuoteRequestDialog } from '@/features/catalog/components/quote-request-dialog';
import type { Product } from '@/types/catalog';

const stockConfig = {
  'in-stock': { label: 'In stock', variant: 'success' as const },
  'low-stock': { label: 'Low stock', variant: 'warning' as const },
  'out-of-stock': { label: 'Out of stock', variant: 'destructive' as const },
  preorder: { label: 'Available for preorder', variant: 'info' as const },
};

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(product.minOrderQty);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const guard = useGuardedAction();
  const stock = stockConfig[product.stockStatus];

  function handleBuyNow() {
    addItem(product, quantity);
    guard(() => router.push('/checkout'), 'Log in to place your order.');
  }

  const activeTier =
    [...product.bulkPricing].reverse().find((tier) => quantity >= tier.minQty) ??
    product.bulkPricing[0];
  const unitPrice = activeTier?.price ?? product.price;

  return (
    <div className="rounded-2xl border p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Badge variant={stock.variant}>{stock.label}</Badge>
        {product.stock > 0 ? (
          <span className="text-muted-foreground text-xs">
            {product.stock.toLocaleString()} available
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{formatCurrency(unitPrice)}</span>
        <span className="text-muted-foreground text-sm">/ {product.unit}</span>
        {product.compareAtPrice ? (
          <span className="text-muted-foreground text-sm line-through">
            {formatCurrency(product.compareAtPrice)}
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground mt-1 text-xs">
        SKU: {product.sku} · Min. order: {product.minOrderQty} {product.unit}
      </p>

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
            onClick={() => setQuantity((q) => Math.max(product.minOrderQty, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.max(product.minOrderQty, Number(event.target.value) || product.minOrderQty),
              )
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

      <div className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={product.stockStatus === 'out-of-stock'}
          onClick={() => addItem(product, quantity)}
        >
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={product.stockStatus === 'out-of-stock'}
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
