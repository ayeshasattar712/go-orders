import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductListing } from '@/features/catalog/components/product-listing';
import { Loader } from '@/components/ui/loader';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse office furniture, IT equipment, grocery, cleaning, and electrical supplies.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader label="Loading products..." />}>
      <ProductListing />
    </Suspense>
  );
}
