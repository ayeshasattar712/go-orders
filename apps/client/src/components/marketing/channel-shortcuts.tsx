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
      <div className="bg-card grid grid-cols-3 gap-2 rounded-sm p-3 shadow-sm sm:grid-cols-6">
        {channels.map((channel) => (
          <Link
            key={channel.href}
            href={channel.href}
            className="hover:text-primary flex flex-col items-center gap-2 rounded-sm px-2 py-2 text-center text-xs font-medium"
          >
            <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <channel.icon className="h-5 w-5" />
            </span>
            {channel.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
