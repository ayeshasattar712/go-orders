'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import type { Product } from '@/types/catalog';

export function FrequentlyBoughtTogether({
  mainProduct,
  companions,
}: {
  mainProduct: Product;
  companions: Product[];
}) {
  const allProducts = [mainProduct, ...companions];
  const [selected, setSelected] = useState<string[]>(allProducts.map((p) => p.id));
  const addItem = useCartStore((state) => state.addItem);

  const total = allProducts
    .filter((product) => selected.includes(product.id))
    .reduce((sum, product) => sum + product.price, 0);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function addSelected() {
    allProducts
      .filter((product) => selected.includes(product.id))
      .forEach((product) => addItem(product, product.minOrderQty));
  }

  return (
    <div className="rounded-2xl border p-6">
      <h3 className="font-semibold">Frequently bought together</h3>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {allProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded border"
                checked={selected.includes(product.id)}
                onChange={() => toggle(product.id)}
              />
              <Link
                href={`/products/${product.slug}`}
                className="bg-muted relative h-16 w-16 overflow-hidden rounded-lg"
              >
                <Image
                  src={product.images[0] ?? ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </Link>
            </label>
            {index < allProducts.length - 1 ? (
              <Plus className="text-muted-foreground h-4 w-4" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm">
          Total for {selected.length} items:{' '}
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </p>
        <Button onClick={addSelected} disabled={selected.length === 0}>
          Add selected to cart
        </Button>
      </div>
    </div>
  );
}
