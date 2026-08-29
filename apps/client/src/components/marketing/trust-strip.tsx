import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const pillars = [
  { icon: Truck, title: 'Free shipping', body: 'On orders over $500.' },
  { icon: RotateCcw, title: 'Fast delivery', body: 'Tracked parcels nationwide.' },
  { icon: ShieldCheck, title: 'Secure payment', body: 'Bank, JazzCash, and Raast.' },
  { icon: Headphones, title: '24/7 support', body: 'Live chat for procurement.' },
];

export function TrustStrip() {
  return (
    <section className="bg-navy border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
              <pillar.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{pillar.title}</p>
              <p className="text-xs text-white/50">{pillar.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
