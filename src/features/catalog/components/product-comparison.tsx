import Image from 'next/image';
import Link from 'next/link';
import { Check, Minus as MinusIcon } from 'lucide-react';
import { Rating } from '@/components/ui/rating';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/catalog';

export function ProductComparison({ products }: { products: Product[] }) {
  if (products.length < 2) return null;

  const specLabels = Array.from(
    new Set(products.flatMap((product) => product.specifications.map((spec) => spec.label))),
  );

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="bg-muted/40 border-b">
            <th className="text-muted-foreground w-40 px-4 py-3 text-left font-medium">Compare</th>
            {products.map((product) => (
              <th key={product.id} className="px-4 py-3 text-left">
                <Link href={`/products/${product.slug}`} className="flex items-center gap-2">
                  <span className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={product.images[0] ?? ''}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </span>
                  <span className="hover:text-primary line-clamp-2 font-medium">
                    {product.name}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="text-muted-foreground px-4 py-3">Price</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3 font-semibold">
                {formatCurrency(product.price)}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="text-muted-foreground px-4 py-3">Rating</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3">
                <Rating value={product.rating} count={product.reviewCount} size="sm" />
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="text-muted-foreground px-4 py-3">Bulk pricing</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3">
                {product.bulkPricing.length > 1 ? (
                  <Check className="text-success h-4 w-4" />
                ) : (
                  <MinusIcon className="text-muted-foreground h-4 w-4" />
                )}
              </td>
            ))}
          </tr>
          {specLabels.map((label) => (
            <tr key={label} className="border-b last:border-0">
              <td className="text-muted-foreground px-4 py-3">{label}</td>
              {products.map((product) => {
                const spec = product.specifications.find((item) => item.label === label);
                return (
                  <td key={product.id} className="px-4 py-3">
                    {spec?.value ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
