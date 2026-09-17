'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IT_EQUIPMENT_IMAGE } from '@/lib/mock-data/categories';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((seconds) => (seconds > 0 ? seconds - 1 : initialSeconds));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initialSeconds]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return { days, hours, minutes, seconds };
}

export function PromoBannerGrid() {
  const { days, hours, minutes, seconds } = useCountdown(2 * 24 * 3600 + 5 * 3600 + 9 * 60 + 59);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/categories/it-equipment"
          className="bg-navy relative flex min-h-[280px] flex-col justify-center overflow-hidden rounded-2xl p-8 text-white lg:h-full"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">Featured</p>
          <h3 className="font-display mt-3 max-w-[16ch] text-3xl font-semibold sm:text-4xl">
            Discount on all IT gear up to 25%
          </h3>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Certified business laptops and hardware with bulk tiers and next-day dispatch.
          </p>
          <Button asChild size="sm" className="mt-6 w-fit">
            <span>
              Shop now <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Button>
          <Image
            src={IT_EQUIPMENT_IMAGE}
            alt="Laptop"
            width={380}
            height={280}
            className="pointer-events-none absolute right-[-8%] bottom-[-10%] w-[55%] object-contain drop-shadow-2xl sm:w-[48%]"
          />
        </Link>

        <div className="flex flex-col gap-4 lg:h-full">
          <Link
            href="/deals"
            className="bg-accent relative flex min-h-[160px] flex-1 flex-col justify-center overflow-hidden rounded-2xl p-6"
          >
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              Limited-time offer
            </p>
            <h3 className="font-display text-foreground mt-2 text-2xl font-semibold">
              Up to 40% off audio &amp; office bundles
            </h3>
            <div className="mt-4 flex items-center gap-2 font-mono text-sm font-bold">
              {[
                { label: 'd', value: days },
                { label: 'h', value: hours },
                { label: 'm', value: minutes },
                { label: 's', value: seconds },
              ].map((unit) => (
                <span
                  key={unit.label}
                  className="text-foreground bg-card rounded-md px-2.5 py-1.5 shadow-sm"
                >
                  {pad(unit.value)}
                  <span className="text-muted-foreground ml-0.5 text-[10px] font-normal">
                    {unit.label}
                  </span>
                </span>
              ))}
            </div>
            <span className="text-primary mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold">
              Grab the deal <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/categories/office-furniture"
              className="relative min-h-[150px] overflow-hidden rounded-2xl bg-[#d8f3dc] p-5"
            >
              <p className="text-xs font-semibold tracking-wide text-emerald-800/70 uppercase">
                Workspace
              </p>
              <h3 className="font-display mt-1 text-lg font-semibold text-zinc-900">
                Standing desks
              </h3>
              <p className="mt-1 text-xs text-zinc-600">Ergonomic setups from $249.</p>
              <Image
                src="https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=500&auto=format&fit=crop"
                alt="Standing desk"
                width={120}
                height={90}
                className="pointer-events-none absolute right-0 bottom-0 w-24 object-contain sm:w-28"
              />
            </Link>

            <Link
              href="/categories/electrical-products"
              className="relative min-h-[150px] overflow-hidden rounded-2xl bg-[#fff3c4] p-5"
            >
              <p className="text-xs font-semibold tracking-wide text-amber-800/70 uppercase">
                Lighting
              </p>
              <h3 className="font-display mt-1 text-lg font-semibold text-zinc-900">
                LED panels &amp; power
              </h3>
              <p className="mt-1 text-xs text-zinc-600">Facility-ready electrical hardware.</p>
              <Image
                src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=500&auto=format&fit=crop"
                alt="Camera lighting"
                width={110}
                height={80}
                className="pointer-events-none absolute right-2 bottom-2 w-20 rounded-lg object-cover sm:w-24"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
