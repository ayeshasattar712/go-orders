import Image from 'next/image';
import { Star, Store, PackageCheck } from 'lucide-react';
import { CategoryIcon } from '@/components/shared/category-icon';
import { formatCompactNumber } from '@/lib/utils';
import type { Category } from '@/types/catalog';

interface CategoryHeroProps {
  category: Category;
  vendorCount: number;
  avgRating: number;
}

export function CategoryHero({ category, vendorCount, avgRating }: CategoryHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="relative h-52 w-full sm:h-64">
        <Image
          src={category.image}
          alt={category.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-14 flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="border-background bg-hero-gradient flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 text-white shadow-lg">
              <CategoryIcon name={category.icon} className="h-9 w-9" />
            </span>
            <div className="pb-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{category.name}</h1>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">{category.description}</p>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
