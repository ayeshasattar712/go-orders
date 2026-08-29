import Link from 'next/link';
import { AtSign, Boxes, Globe } from 'lucide-react';
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
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/home" className="flex items-center gap-2.5">
              <span className="bg-hero-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-white">
                <Boxes className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">
                {clientEnv.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Everything your business needs in one place — procurement, vendor management,
              inventory, and accounting, unified.
            </p>
            <div className="mt-5 flex gap-3 text-white/55">
              <Link href="#" aria-label="Social profile" className="hover:text-white">
                <AtSign className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Website" className="hover:text-white">
                <Globe className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold tracking-wide">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-white/40 hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {clientEnv.NEXT_PUBLIC_APP_NAME}, Inc. All rights reserved.
          </p>
          <p className="tracking-wide">Visa · Mastercard · JazzCash · Raast · Bank transfer</p>
        </div>
      </div>
    </footer>
  );
}
