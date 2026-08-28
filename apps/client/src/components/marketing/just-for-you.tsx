import { ProductCard } from '@/components/shared/product-card';
import type { Product } from '@/types/catalog';

export function JustForYou({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-3 py-3 pb-10 sm:px-4">
      <h2 className="mb-3 text-center text-lg font-bold tracking-wide uppercase">Just for you</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
