'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  className?: string;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, className, layout = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const guard = useGuardedAction();

  const handleAddToCart = () => guard(() => addItem(product), 'Sign in to add items to your cart.');
  const handleToggleWishlist = () =>
    guard(() => toggleWishlist(product.id), 'Sign in to save items to your wishlist.');
  const handleBuyNow = () =>
    guard(() => {
      addItem(product);
      router.push('/checkout');
    }, 'Sign in to buy this item and complete your order.');

  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  if (layout === 'list') {
    return (
      <div className={cn('card-hover bg-card flex gap-4 rounded-xl border p-4', className)}>
        <Link
          href={`/products/${product.slug}`}
          className="bg-muted relative h-32 w-32 shrink-0 overflow-hidden rounded-lg"
        >
          <Image
            src={product.images[0] ?? ''}
            alt={product.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/products/${product.slug}`} className="hover:text-primary font-medium">
                {product.name}
              </Link>
              <button type="button" onClick={handleToggleWishlist} aria-label="Save to wishlist">
                <Heart className={cn('h-4 w-4', isSaved && 'fill-destructive text-destructive')} />
              </button>
            </div>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {product.shortDescription}
            </p>
            <Rating value={product.rating} count={product.reviewCount} size="sm" className="mt-2" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
              <p className="text-muted-foreground text-xs">per {product.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" /> Add
              </Button>
              <Button size="sm" onClick={handleBuyNow}>
                <Zap className="h-4 w-4" /> Buy now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('card-hover group bg-card relative flex flex-col rounded-xl border', className)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="bg-muted relative aspect-square overflow-hidden rounded-t-xl"
      >
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount ? <Badge variant="brand">-{discount}%</Badge> : null}
          {product.isBestSeller ? <Badge variant="success">Best Seller</Badge> : null}
          {product.isNew ? <Badge variant="info">New</Badge> : null}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            handleToggleWishlist();
          }}
          aria-label="Save to wishlist"
          className="bg-background/90 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-transform hover:scale-105"
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-destructive text-destructive')} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.slug}`}
          className="hover:text-primary line-clamp-2 text-sm font-medium"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} size="sm" />
        <div className="mt-auto flex items-center justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
              {product.compareAtPrice ? (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">
              Min. {product.minOrderQty} {product.unit}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleBuyNow} aria-label="Buy now">
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
