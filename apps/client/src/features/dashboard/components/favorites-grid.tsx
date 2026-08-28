'use client';

import { useWishlistStore } from '@/store/wishlist-store';
import { products } from '@/lib/mock-data';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FavoritesGrid() {
  const productIds = useWishlistStore((state) => state.productIds);
  const favoriteProducts = products.filter((product) => productIds.includes(product.id));

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the heart icon on any product to save it here for quick reordering."
        action={
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {favoriteProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
