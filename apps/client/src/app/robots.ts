import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/profile',
        '/orders',
        '/favorites',
        '/checkout',
        '/cart',
        '/invoices',
        '/credit',
        '/quotations',
        '/notifications',
        '/chat',
        '/procurement',
        '/inventory',
        '/delivery',
        '/accounting',
        '/crm',
        '/ai-forecasting',
        '/assets',
        '/tenders',
        '/bi',
        '/admin',
        '/api/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
