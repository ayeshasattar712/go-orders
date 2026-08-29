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
  compact?: boolean;
}

export function ProductCard({
  product,
  className,
  layout = 'grid',
  compact = false,
}: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const guard = useGuardedAction();

  const handleAddToCart = () => addItem(product);
  const handleToggleWishlist = () =>
    guard(() => toggleWishlist(product.id), 'Sign in to save items to your wishlist.');
  const handleBuyNow = () => {
    addItem(product);
    guard(() => router.push('/checkout'), 'Log in to place your order.');
  };

  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  if (layout === 'list') {
    return (
      <div
        className={cn('bg-card card-hover flex gap-4 rounded-xl border p-4 shadow-sm', className)}
      >
        <Link
          href={`/products/${product.slug}`}
        className="bg-white relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border"
        >
          <Image
            src={product.images[0] ?? ''}
            alt={product.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
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
          <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-primary text-lg font-bold">{formatCurrency(product.price)}</p>
              {product.compareAtPrice ? (
                <p className="text-muted-foreground text-xs line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="flex min-w-0 shrink-0 gap-2">
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

  if (compact) {
    return (
      <div
        className={cn(
          'group bg-card hover:border-primary relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-transparent shadow-sm hover:shadow-md',
          className,
        )}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-square overflow-hidden bg-white"
        >
          <Image
            src={product.images[0] ?? ''}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 16vw, 50vw"
          />
          {discount ? (
            <span className="bg-primary text-primary-foreground absolute top-0 right-0 px-1.5 py-0.5 text-[10px] font-bold">
              -{discount}%
            </span>
          ) : null}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-8 text-xs leading-4"
          >
            {product.name}
          </Link>
          <p className="text-primary text-base leading-tight font-bold">
            {formatCurrency(product.price)}
          </p>
          {product.compareAtPrice ? (
            <p className="text-muted-foreground text-[11px] line-through">
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : null}
          <p className="text-muted-foreground text-[11px]">
            {product.reviewCount.toLocaleString()} sold
          </p>
          <div className="mt-auto flex min-w-0 gap-1.5 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 min-w-0 flex-1 px-1.5 text-[11px]"
              onClick={handleAddToCart}
            >
              Add
            </Button>
            <Button
              size="sm"
              className="h-8 min-w-0 flex-1 px-1.5 text-[11px]"
              onClick={handleBuyNow}
            >
              Buy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group bg-card card-hover hover:border-primary relative flex min-w-0 flex-col overflow-hidden rounded-xl border shadow-sm',
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="bg-white relative aspect-square overflow-hidden"
      >
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount ? <Badge className="rounded-sm">{`-${discount}%`}</Badge> : null}
          {product.isBestSeller ? <Badge variant="success">Mall</Badge> : null}
          {product.isNew ? <Badge variant="info">New</Badge> : null}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            handleAddToCart();
          }}
          aria-label="Add to cart"
          className="bg-primary text-primary-foreground absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg shadow-md"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="hover:text-primary line-clamp-2 min-h-10 text-sm leading-5"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} size="sm" />
        <div className="mt-auto flex min-w-0 flex-col gap-2.5 pt-1">
          <div className="min-w-0">
            <p className="text-primary text-lg leading-tight font-bold">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className="text-muted-foreground text-xs line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-0.5 text-xs">
              {product.reviewCount.toLocaleString()} sold
            </p>
          </div>
          <div className="flex min-w-0 items-stretch gap-2">
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-9 min-w-0 flex-1 rounded-lg px-2" onClick={handleBuyNow}>
              Buy now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
