import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
}
