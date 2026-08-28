import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return [
    {
      url: `${base}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    { url: `${base}/admin`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];
}
