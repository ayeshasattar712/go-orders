import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/mock-data';

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Shop by category</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Everything your teams reorder — in one catalog.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {categories
          .filter((category) => category.status === 'active')
          .map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <span className="relative mb-3 h-28 w-28 overflow-hidden rounded-full border bg-muted shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </span>
              <p className="text-sm font-semibold">{category.name}</p>
              <p className="text-muted-foreground text-xs">
                {category.productCount.toLocaleString()} products
              </p>
              <p className="text-primary mt-1 text-xs font-medium">Explore now</p>
            </Link>
          ))}
      </div>
    </section>
  );
}
