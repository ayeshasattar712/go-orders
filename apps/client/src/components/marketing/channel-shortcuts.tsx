import Link from 'next/link';
import { Bolt, ShoppingBag, Store, Sparkles, Home, Laptop } from 'lucide-react';

const channels = [
  { href: '/deals', label: 'Flash Sale', icon: Bolt },
  { href: '/vendors', label: 'Mall', icon: Store },
  { href: '/categories/grocery-pantry', label: 'Grocery', icon: ShoppingBag },
  { href: '/categories/office-furniture', label: 'Home', icon: Home },
  { href: '/categories/it-equipment', label: 'Electronics', icon: Laptop },
  { href: '/products', label: 'Just for you', icon: Sparkles },
];

export function ChannelShortcuts() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4">
      <div className="surface-panel grid grid-cols-3 gap-1 rounded-2xl border p-2 sm:grid-cols-6 sm:p-3">
        {channels.map((channel) => (
          <Link
            key={channel.href}
            href={channel.href}
            className="hover:bg-primary/5 hover:text-primary flex flex-col items-center gap-2.5 rounded-xl px-2 py-3 text-center text-xs font-semibold transition-colors"
          >
            <span className="bg-hero-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md shadow-primary/25">
              <channel.icon className="h-5 w-5" />
            </span>
            {channel.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
