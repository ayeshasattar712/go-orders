import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Shop by Category',
  description:
    'Browse GoOrder marketplace categories including office furniture, grocery & pantry, office supplies, IT equipment, cleaning supplies, and electrical products.',
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop by category</h1>
        <p className="text-muted-foreground mt-2">
          Six product categories, thousands of vetted vendors, and bulk pricing built for business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories
          .filter((category) => category.status === 'active')
          .map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card-hover group bg-card relative flex flex-col overflow-hidden rounded-2xl border"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-2 p-5">
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {category.productCount.toLocaleString()} products
                  </p>
                </div>
                <ArrowUpRight className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
