import Image from 'next/image';
import Link from 'next/link';
import { Star, Store, PackageCheck } from 'lucide-react';
import { CategoryIcon } from '@/components/shared/category-icon';
import { getCategoryChildren } from '@/lib/mock-data';
import { formatCompactNumber } from '@/lib/utils';
import type { Category } from '@/types/catalog';

interface CategoryHeroProps {
  category: Category;
  vendorCount: number;
  avgRating: number;
}

export function CategoryHero({ category, vendorCount, avgRating }: CategoryHeroProps) {
  const children = getCategoryChildren(category.slug);

  return (
    <div>
      <div className="relative h-52 w-full sm:h-72">
        <Image
          src={category.image}
          alt={category.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-5 sm:px-6 sm:pb-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-hero-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
              <CategoryIcon name={category.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {category.name}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/80">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-3 py-6 sm:max-w-xl">
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <PackageCheck className="text-primary h-4 w-4" />
              {formatCompactNumber(category.productCount)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Products</p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <Store className="text-primary h-4 w-4" />
              {vendorCount}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Vendors</p>
          </div>
          <div className="bg-card rounded-xl border p-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <Star className="fill-warning text-warning h-4 w-4" />
              {avgRating.toFixed(1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Avg. rating</p>
          </div>
        </div>

        {children.length ? (
          <div className="flex flex-wrap gap-2 pb-2">
            {children.map((child) => (
              <Link
                key={child.slug}
                href={`/products?category=${category.slug}&q=${encodeURIComponent(child.name)}`}
                className="hover:border-primary hover:text-primary hover:bg-primary/5 rounded-full border px-3 py-1.5 text-sm"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
