import type { Metadata } from 'next';
import { getProducts, getVendors } from '@/lib/catalog/catalog-repository';
import { VendorCard } from '@/components/shared/vendor-card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vendor Directory',
  description: 'Browse verified vendors on the GoOrder marketplace.',
};

export default async function VendorsPage() {
  const [vendors, products] = await Promise.all([getVendors(), getProducts()]);
  const approvedVendors = vendors.filter((vendor) => vendor.status === 'approved');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verified vendors</h1>
        <p className="text-muted-foreground mt-2">
          {approvedVendors.length} vetted suppliers across office furniture, IT, grocery, cleaning,
          and electrical categories.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {approvedVendors.map((vendor) => {
          const productCount = products.filter((p) => p.vendorId === vendor.id).length;
          return (
            <VendorCard key={vendor.id} vendor={vendor} productCount={productCount} />
          );
        })}
      </div>
    </div>
  );
}
