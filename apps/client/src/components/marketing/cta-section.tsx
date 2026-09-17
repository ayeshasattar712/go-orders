import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck, Tag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Tag, label: 'Bulk savings on every order' },
  { icon: Truck, label: 'Flexible MOQs & fast dispatch' },
  { icon: ShieldCheck, label: 'Verified, vetted vendors' },
];

export function CtaSection() {
  return (
    <section className="bg-navy relative overflow-hidden px-4 py-14 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-xl text-center lg:text-left">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Wholesale Pricing Made Simple
          </h2>
          <p className="mt-3 text-white/65">
            Unlock better pricing, flexible MOQs, and verified manufacturers — sourcing built for
            growing businesses.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 text-sm text-white/80">
                <span className="bg-primary/15 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <feature.icon className="h-4 w-4" />
                </span>
                {feature.label}
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-7">
            <Link href="/products">
              Start Sourcing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <span className="bg-primary/10 text-primary hidden h-40 w-40 shrink-0 items-center justify-center rounded-3xl lg:flex">
          <Package className="h-16 w-16" strokeWidth={1.5} />
        </span>
      </div>
    </section>
  );
}
