import type { MetadataRoute } from 'next';
import { IS_INDEXABLE, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: IS_INDEXABLE
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/*?preview='] }]
      : [{ userAgent: '*', disallow: '/' }],
    ...(IS_INDEXABLE ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}
