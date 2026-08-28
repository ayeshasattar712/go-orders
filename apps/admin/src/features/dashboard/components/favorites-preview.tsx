'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWishlistStore } from '@/store/wishlist-store';
import { products, vendors } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export function FavoritesPreview() {
  const productIds = useWishlistStore((state) => state.productIds);
  const favoriteProducts = products
    .filter((product) => productIds.includes(product.id))
    .slice(0, 4);
  const favoriteVendors = vendors.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-destructive h-4 w-4" /> Favorites
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No favorite products yet. Tap the heart icon on any product to save it here.
          </p>
        ) : (
          <div className="space-y-3">
            {favoriteProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="hover:bg-muted flex items-center gap-3 rounded-lg p-1.5"
              >
                <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={product.images[0] ?? ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <p className="flex-1 truncate text-sm">{product.name}</p>
                <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Favorite vendors
          </p>
          <div className="flex flex-wrap gap-2">
            {favoriteVendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="hover:border-primary hover:text-primary rounded-full border px-3 py-1 text-xs"
              >
                {vendor.name}
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
