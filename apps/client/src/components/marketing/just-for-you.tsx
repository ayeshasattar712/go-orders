import { ProductCard } from '@/components/shared/product-card';
import type { Product } from '@/types/catalog';

export function JustForYou({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <div className="mb-6 text-center">
        <p className="text-primary mb-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
          Personalized
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Just for you</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
