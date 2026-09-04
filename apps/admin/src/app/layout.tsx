import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Outfit } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import { clientEnv } from '@/lib/env';
import '@/styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const appName = clientEnv.NEXT_PUBLIC_APP_NAME;
const appUrl = clientEnv.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    'GoOrder — Everything Your Business Needs in One Place. Procurement, vendor management, inventory, accounting, and e-commerce, unified.',
  applicationName: appName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: appName,
    title: appName,
    description:
      'GoOrder unifies B2B/B2C procurement, vendor management, inventory, and accounting ERP into one seamless marketplace platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description:
      'GoOrder unifies B2B/B2C procurement, vendor management, inventory, and accounting ERP into one seamless marketplace platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0F' },
  ],
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
