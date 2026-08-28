import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/mock-data';

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Six product categories, thousands of vetted vendors.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/categories">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories
          .filter((category) => category.status === 'active')
          .map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card-hover group bg-card relative flex flex-col overflow-hidden rounded-xl border"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-2 p-3">
                <div>
                  <p className="text-sm font-semibold">{category.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {category.productCount.toLocaleString()} items
                  </p>
                </div>
                <ArrowUpRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
