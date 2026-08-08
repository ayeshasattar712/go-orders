import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

const appName = clientEnv.NEXT_PUBLIC_APP_NAME;
const appUrl = clientEnv.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    'Enterprise-grade Next.js boilerplate with JWT auth, RBAC, and production security defaults.',
  applicationName: appName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: appName,
    title: appName,
    description:
      'Secure Next.js App Router boilerplate for SaaS, fintech, healthcare, and enterprise platforms.',
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description:
      'Secure Next.js App Router boilerplate for SaaS, fintech, healthcare, and enterprise platforms.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
