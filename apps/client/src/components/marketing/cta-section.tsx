import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="bg-navy-glow px-4 py-20 text-center text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Ready to modernize procurement?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Join thousands of businesses saving time and money with GoOrder&apos;s unified
          marketplace and ERP platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              Explore now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/support/contact" className="text-sm font-medium text-white/75 hover:text-white">
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}
