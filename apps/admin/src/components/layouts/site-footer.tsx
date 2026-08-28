import Link from 'next/link';
import { AtSign, Boxes, Globe, Rss } from 'lucide-react';
import { clientEnv } from '@/lib/env';
import { categories } from '@/lib/mock-data';

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About GoOrder', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Sustainability', href: '/sustainability' },
    ],
  },
  {
    title: 'For Business',
    links: [
      { label: 'Become a vendor', href: '/vendors/apply' },
      { label: 'Enterprise procurement', href: '/procurement' },
      { label: 'Credit & Net-30 terms', href: '/credit' },
      { label: 'Bulk ordering', href: '/products' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/support' },
      { label: 'Track an order', href: '/orders' },
      { label: 'Returns', href: '/support/returns' },
      { label: 'Contact sales', href: '/support/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/legal/terms' },
      { label: 'Privacy policy', href: '/legal/privacy' },
      { label: 'Security', href: '/legal/security' },
      { label: 'Compliance', href: '/legal/compliance' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-muted/30 mt-24 border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white">
                <Boxes className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">
                {clientEnv.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              Everything your business needs in one place — procurement, vendor management,
              inventory, and accounting, unified.
            </p>
            <div className="text-muted-foreground mt-5 flex gap-3">
              <Link href="#" aria-label="Social profile" className="hover:text-foreground">
                <AtSign className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Blog" className="hover:text-foreground">
                <Rss className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Website" className="hover:text-foreground">
                <Globe className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t pt-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="text-muted-foreground hover:border-primary hover:text-primary rounded-full border px-3 py-1.5 text-xs"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="text-muted-foreground mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {clientEnv.NEXT_PUBLIC_APP_NAME}, Inc. All rights reserved.
          </p>
          <p>SOC 2 Type II · ISO 27001 · PCI DSS Compliant</p>
        </div>
      </div>
    </footer>
  );
}
