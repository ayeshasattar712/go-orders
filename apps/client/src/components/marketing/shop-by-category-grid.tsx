import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/mock-data';

export function ShopByCategoryGrid() {
  const featured = categories.filter((category) => category.status === 'active').slice(0, 5);
  const [first, second, ...rest] = featured;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h2 className="font-display text-foreground text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Collection List
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[first, second].map((category) =>
          category ? <CollectionTile key={category.id} category={category} size="lg" /> : null,
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {rest.map((category) => (
          <CollectionTile key={category.id} category={category} size="sm" />
        ))}
      </div>
    </section>
  );
}

function CollectionTile({
  category,
  size,
}: {
  category: (typeof categories)[number];
  size: 'lg' | 'sm';
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={
        size === 'lg'
          ? 'group relative block h-56 overflow-hidden rounded-2xl sm:h-64'
          : 'group relative block h-40 overflow-hidden rounded-2xl sm:h-48'
      }
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes={size === 'lg' ? '(min-width: 640px) 48vw, 100vw' : '(min-width: 640px) 32vw, 100vw'}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div>
          <h3 className="font-display text-lg font-bold text-white sm:text-2xl">{category.name}</h3>
          <p className="mt-1 text-xs text-white/75">
            {category.productCount.toLocaleString()} products
          </p>
        </div>
        <span className="bg-primary text-primary-foreground inline-flex w-fit items-center rounded-full px-4 py-1.5 text-xs font-semibold">
          Shop Now
        </span>
      </div>
    </Link>
  );
}
