'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addProductToCart } from '@/store/cart-feedback-store';
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
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isSaved = useWishlistStore((state) => state.isSaved(product.id));
  const guard = useGuardedAction();

  const handleAddToCart = (event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    addProductToCart(product);
  };
  const handleToggleWishlist = () =>
    guard(() => toggleWishlist(product.id), 'Sign in to save items to your wishlist.');

  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  if (layout === 'list') {
    return (
      <div
        className={cn(
          'bg-card card-hover flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row',
          className,
        )}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border bg-white sm:h-24 sm:w-24"
        >
          <Image
            src={product.images[0] ?? ''}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="96px"
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
          </div>
          <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-primary text-lg font-bold">{formatCurrency(product.price)}</p>
            </div>
            <Button type="button" size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'group bg-card card-hover hover:border-primary relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-transparent shadow-sm',
          className,
        )}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative flex aspect-[5/4] max-h-36 items-center justify-center overflow-hidden bg-white"
        >
          <Image
            src={product.images[0] ?? ''}
            alt={product.name}
            fill
            className="object-contain p-3"
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
          <Button
            type="button"
            size="sm"
            className="mt-auto h-8 w-full px-1.5 text-[11px]"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
          </Button>
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
        className="relative flex aspect-[5/4] max-h-44 items-center justify-center overflow-hidden bg-white sm:max-h-48"
      >
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-contain p-3"
          sizes="(min-width: 1024px) 20vw, 45vw"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount ? <Badge className="rounded-sm">{`-${discount}%`}</Badge> : null}
          {product.isBestSeller ? <Badge variant="success">Mall</Badge> : null}
          {product.isNew ? <Badge variant="info">New</Badge> : null}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="hover:text-primary line-clamp-2 min-h-10 text-sm leading-5"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex min-w-0 flex-col gap-2.5 pt-1">
          <p className="text-primary text-lg leading-tight font-bold">
            {formatCurrency(product.price)}
          </p>
          <Button type="button" size="sm" className="h-9 w-full rounded-lg" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" /> Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
