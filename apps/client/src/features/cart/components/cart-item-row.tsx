'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore, type CartItem } from '@/store/cart-store';

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const saveForLater = useCartStore((state) => state.saveForLater);
  const moveToCart = useCartStore((state) => state.moveToCart);

  return (
    <div className="flex gap-4 border-b py-5 last:border-0">
      <Link
        href={`/products/${item.slug}`}
        className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-lg"
      >
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${item.slug}`} className="hover:text-primary font-medium">
              {item.name}
            </Link>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(item.price)} / {item.unit}
            </p>
          </div>
          <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          {item.savedForLater ? (
            <Button variant="ghost" size="sm" onClick={() => moveToCart(item.productId)}>
              <RotateCcw className="h-3.5 w-3.5" /> Move to cart
            </Button>
          ) : (
            <div className="flex items-center rounded-lg border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center text-sm">{item.quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            {!item.savedForLater ? (
              <button
                type="button"
                onClick={() => saveForLater(item.productId)}
                className="hover:text-foreground flex items-center gap-1"
              >
                <Heart className="h-3.5 w-3.5" /> Save for later
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="hover:text-destructive flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
