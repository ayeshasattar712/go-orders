import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="bg-hero-gradient shadow-primary/20 relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white shadow-lg sm:px-16">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_10%_10%,white,transparent_30%),radial-gradient(circle_at_90%_90%,white,transparent_30%)] opacity-20" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to modernize your procurement?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Join thousands of businesses saving time and money with GoOrder&apos;s unified
            marketplace and ERP platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="text-primary hover:bg-white">
              <Link href="/">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/5 text-white hover:bg-white/15"
            >
              <Link href="/support/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
