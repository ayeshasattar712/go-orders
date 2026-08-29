import { vendors } from '@/lib/mock-data';
import { VendorCard } from '@/components/shared/vendor-card';

export function VendorRail() {
  const featured = vendors.filter((vendor) => vendor.status === 'approved').slice(0, 3);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Featured vendors</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Verified suppliers with proven fulfillment performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
