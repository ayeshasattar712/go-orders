import Link from 'next/link';
import { FileText, PackageSearch, RefreshCcw, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  { href: '/products', label: 'Shop products', icon: ShoppingBag },
  { href: '/orders', label: 'Track an order', icon: PackageSearch },
  { href: '/procurement', label: 'Start an RFQ', icon: FileText },
  { href: '/products?sort=best-sellers', label: 'Reorder favorites', icon: RefreshCcw },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="hover:border-primary hover:bg-primary/5 flex flex-col items-start gap-2 rounded-xl border p-4 text-sm font-medium transition-colors"
          >
            <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <action.icon className="h-4 w-4" />
            </span>
            {action.label}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
