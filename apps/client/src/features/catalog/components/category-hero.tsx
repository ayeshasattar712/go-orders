'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Button } from '@/components/ui/button';
import { addProductToCart } from '@/store/cart-feedback-store';
import { useGuardedAction } from '@/hooks/use-guarded-action';
import { getCategoryChildren } from '@/lib/mock-data/categories';
import { cn, formatCurrency } from '@/lib/utils';
import type { Category, Product } from '@/types/catalog';

interface CategoryHeroProps {
  category: Category;
  activeSub?: string;
  galleryImages: string[];
  products: Product[];
}

export function CategoryHero({ category, activeSub, galleryImages, products }: CategoryHeroProps) {
  const router = useRouter();
  const guard = useGuardedAction();
  const children = getCategoryChildren(category.slug);
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    if (products.length > 0) return products.slice(0, 8);
    return galleryImages.filter(Boolean).map((image, index) => ({
      id: `gallery-${index}`,
      slug: '',
      name: category.name,
      images: [image],
      price: 0,
      stockStatus: 'in-stock' as const,
    }));
  }, [products, galleryImages, category.name]);

  const productKey = products.map((product) => product.id).join(',');

  const activeKey = `${activeSub ?? ''}:${productKey}`;
  const [syncedActiveKey, setSyncedActiveKey] = useState(activeKey);
  if (activeKey !== syncedActiveKey) {
    setSyncedActiveKey(activeKey);
    setActive(0);
  }

  const current = items[Math.min(active, Math.max(items.length - 1, 0))] ?? null;
  const selectedProduct = products.find((product) => product.id === current?.id) ?? null;
  const image = current?.images[0] ?? '';

  function handleAddToCart(event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!selectedProduct) return;
    addProductToCart(selectedProduct);
  }

  function handleBuyNow(event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!selectedProduct) return;
    addProductToCart(selectedProduct);
    guard(() => router.push('/checkout'), 'Log in to place your order and checkout securely.');
  }

  return (
    <div className="border-b bg-[#f8f9fa]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="bg-hero-gradient shadow-primary/25 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
            <CategoryIcon name={category.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">{category.name}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>

        {current ? (
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex w-full max-w-xl flex-col gap-3">
              <div className="relative aspect-[16/9] max-h-52 w-full overflow-hidden rounded-xl border bg-white sm:max-h-64">
                {selectedProduct ? (
                  <Link href={`/products/${selectedProduct.slug}`} className="absolute inset-0">
                    <Image
                      src={image}
                      alt={current.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(min-width: 640px) 36rem, 90vw"
                    />
                  </Link>
                ) : (
                  <Image
                    src={image}
                    alt={current.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 640px) 36rem, 90vw"
                  />
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      'relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white sm:h-14 sm:w-20',
                      active === index ? 'border-foreground' : 'border-border',
                    )}
                  >
                    <Image
                      src={item.images[0] ?? ''}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {children.length || selectedProduct ? (
              <div className="flex w-full max-w-md flex-col gap-5">
                {children.length ? (
                  <div className="flex flex-wrap gap-2">
                    {children.map((child) => (
                      <Link
                        key={child.slug}
                        href={`/categories/${category.slug}?sub=${child.slug}`}
                        className={
                          activeSub === child.slug
                            ? 'border-primary bg-primary/5 text-primary rounded-full border px-3 py-1.5 text-sm'
                            : 'rounded-full border bg-white px-3 py-1.5 text-sm'
                        }
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}

                {selectedProduct ? (
                  <div className="rounded-xl border bg-white p-3 sm:p-4">
                    <Link
                      href={`/products/${selectedProduct.slug}`}
                      className="line-clamp-2 text-sm font-semibold sm:text-base"
                    >
                      {selectedProduct.name}
                    </Link>
                    <p className="text-primary mt-1 text-lg font-bold">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-0 flex-1"
                        onClick={handleAddToCart}
                        disabled={selectedProduct.stockStatus === 'out-of-stock'}
                      >
                        <ShoppingCart className="h-4 w-4" /> Add to cart
                      </Button>
                      <Button
                        type="button"
                        className="min-w-0 flex-1"
                        onClick={handleBuyNow}
                        disabled={selectedProduct.stockStatus === 'out-of-stock'}
                      >
                        <Zap className="h-4 w-4" /> Buy now
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
