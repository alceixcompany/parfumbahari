import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getPublishedPosts, getPublishedProducts } from '@/lib/publicContent';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([getPublishedPosts(), getPublishedProducts()]);
  return [...['', '/hakkimizda', '/urun-katalogu', '/galeri', '/haberler', '/gizlilik-politikasi'].map(path => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' as const, priority: path === '' ? 1 : path === '/urun-katalogu' ? .9 : .7 })), ...products.map(p => ({ url: `${SITE_URL}/urun-katalogu/${p.slug}`, changeFrequency: 'monthly' as const, priority: .8 })), ...posts.map(p => ({ url: `${SITE_URL}/haberler/${p.slug}`, lastModified: new Date((p.modifiedDate || p.publishedDate) + (p.modifiedDate?.includes('T') ? '' : 'T12:00:00Z')), changeFrequency: 'monthly' as const, priority: .6 }))];
}
