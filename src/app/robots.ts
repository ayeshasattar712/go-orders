import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/users', '/settings', '/profile', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
