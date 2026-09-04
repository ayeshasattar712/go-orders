import Image from 'next/image';
import Link from 'next/link';
import { Star, Store, PackageCheck } from 'lucide-react';
import { CategoryIcon } from '@/components/shared/category-icon';
import {
  getCategoryChildren,
  IT_EQUIPMENT_IMAGE,
  OFFICE_SUPPLIES_IMAGE,
} from '@/lib/mock-data/categories';
import { formatCompactNumber } from '@/lib/utils';
import type { Category } from '@/types/catalog';

interface CategoryHeroProps {
  category: Category;
  vendorCount: number;
  avgRating: number;
}

function categoryHeroImage(category: Category) {
  if (category.slug === 'office-supplies') return OFFICE_SUPPLIES_IMAGE;
  if (category.slug === 'it-equipment') return IT_EQUIPMENT_IMAGE;
  return category.image;
}

export function CategoryHero({ category, vendorCount, avgRating }: CategoryHeroProps) {
  const children = getCategoryChildren(category.slug);
  const imageSrc = categoryHeroImage(category);

  return (
    <div className="border-b bg-[#f8f9fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <span className="bg-hero-gradient shadow-primary/25 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md">
                <CategoryIcon name={category.icon} className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl border bg-white shadow-lg lg:mx-0">
            <Image
              src={imageSrc}
              alt={category.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 420px"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
          <div className="bg-card rounded-xl border p-2.5 text-center sm:p-4">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <PackageCheck className="text-primary h-4 w-4" />
              {formatCompactNumber(category.productCount)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Products</p>
          </div>
          <div className="bg-card rounded-xl border p-2.5 text-center sm:p-4">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <Store className="text-primary h-4 w-4" />
              {vendorCount}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Vendors</p>
          </div>
          <div className="bg-card rounded-xl border p-2.5 text-center sm:p-4">
            <p className="flex items-center justify-center gap-1.5 text-lg font-bold">
              <Star className="fill-warning text-warning h-4 w-4" />
              {avgRating.toFixed(1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Avg. rating</p>
          </div>
        </div>

        {children.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.slug}
                href={`/products?category=${category.slug}&q=${encodeURIComponent(child.name)}`}
                className="hover:border-primary hover:text-primary hover:bg-primary/5 rounded-full border bg-white px-3 py-1.5 text-sm"
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
