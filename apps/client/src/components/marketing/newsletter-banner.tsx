'use client';

import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterBanner() {
  return (
    <section className="bg-[#f8f9fa] px-4 py-10 sm:px-6">
      <div className="glow-purple mx-auto flex max-w-7xl flex-col items-center gap-6 rounded-3xl bg-navy px-6 py-10 text-center text-white sm:px-12 lg:flex-row lg:text-left">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary">
          <Mail className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-semibold">Stay in the loop</h2>
          <p className="mt-1 text-sm text-white/60">
            New arrivals, flash deals, and procurement tips — no spam.
          </p>
        </div>
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-11 rounded-full border-white/15 bg-white/10 text-white placeholder:text-white/40"
          />
          <Button type="submit" className="h-11 rounded-full px-6">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
