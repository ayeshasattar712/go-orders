import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/catalog/catalog-repository';
import { CategoryIcon } from '@/components/shared/category-icon';
import { getCategoryChildren } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop by Category',
  description:
    'Browse GoOrder marketplace categories including office furniture, grocery & pantry, office supplies, IT equipment, cleaning supplies, and electrical products.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
          Browse
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Shop by category</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Open a category to see its products. Every category has 100+ items ready for ordering.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const children = getCategoryChildren(category.slug).slice(0, 4);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group card-hover bg-card overflow-hidden rounded-2xl border shadow-sm"
            >
              <div className="relative h-40 overflow-hidden bg-zinc-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <CategoryIcon name={category.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-white/80">
                      {category.productCount.toLocaleString()} products
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground line-clamp-2 text-sm">{category.description}</p>
                  {children.length > 0 ? (
                    <p className="text-muted-foreground mt-2 truncate text-xs">
                      {children.map((child) => child.name).join(' · ')}
                    </p>
                  ) : null}
                </div>
                <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
