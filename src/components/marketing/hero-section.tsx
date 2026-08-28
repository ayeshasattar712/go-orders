'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Search, ShieldCheck, TrendingUp, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const stats = [
  { label: 'Verified vendors', value: '12,400+' },
  { label: 'Products listed', value: '2.1M+' },
  { label: 'Businesses served', value: '48,000+' },
  { label: 'On-time delivery', value: '98.6%' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'SOC 2 & PCI DSS secured' },
  { icon: Truck, label: 'Nationwide bulk logistics' },
  { icon: TrendingUp, label: 'AI-powered demand insights' },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <section className="bg-hero-gradient relative overflow-hidden text-white">
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_0%,white,transparent_30%)] opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            Trusted by 48,000+ businesses worldwide
          </span>
          <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Everything Your Business Needs, In One Place
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Procure office essentials, manage vendors, track inventory, and run your finances —
            GoOrder unifies enterprise commerce and ERP into one seamless platform.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              router.push(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
            }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl"
          >
            <Search className="text-muted-foreground ml-2 h-5 w-5 shrink-0" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search 2M+ products, vendors, or SKUs..."
              className="text-foreground h-11 border-0 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/products">
                Browse marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/5 text-white hover:bg-white/15"
            >
              <Link href="/procurement">Start an RFQ</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2">
                <badge.icon className="h-4 w-4" />
                {badge.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-white/75 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
