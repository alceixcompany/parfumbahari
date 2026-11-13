import type { Metadata } from 'next';
import { business } from '@/data/brand';
const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const SITE_URL = new URL(configuredOrigin || 'http://localhost:3000').origin;
export const IS_INDEXABLE = process.env.NODE_ENV === 'production' && Boolean(configuredOrigin) && new URL(SITE_URL).protocol === 'https:' && !['localhost', '127.0.0.1'].includes(new URL(SITE_URL).hostname) && process.env.VERCEL_ENV !== 'preview';
export const SEO_CONFIG = {
  name: business.name,
  tagline: business.tagline,
  shortDescription: `Parfum Bahari — ${business.tagline}. Parfüm koleksiyonumuzu keşfedin, ürün fotoğraflarını inceleyin ve favori kokularınızı bulun.`,
  fullDescription: 'Parfum Bahari, kokuların uyandırdığı hislerden ilham alır. Ürün kataloğumuzda parfüm koleksiyonumuzu keşfedin; ürün fotoğraflarını, açıklamalarını ve marka hikâyemizi inceleyin.',
  images: { hero: '/parfum-bahari/hero-branded.webp', icon: '/parfum-bahari/icon-pb.png' },
  keywords: ['Parfum Bahari', 'parfüm kataloğu', 'parfüm koleksiyonu', 'parfüm çeşitleri', 'eau de parfum'],
};
export function getBrandSchema() {
  return { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: business.name, url: SITE_URL, logo: `${SITE_URL}/parfum-bahari/logo-gold.png`, image: `${SITE_URL}${SEO_CONFIG.images.hero}`, description: SEO_CONFIG.fullDescription,
    ...(business.phone ? { telephone: business.phone } : {}), ...(business.email ? { email: business.email } : {}), ...(business.instagram ? { sameAs: [business.instagram] } : {}) };
}
export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL }, ...items.map((item, i) => ({ '@type': 'ListItem', position: i + 2, name: item.name, item: `${SITE_URL}${item.path}` }))] };
}
export const defaultRobots: Metadata['robots'] = { index: IS_INDEXABLE, follow: IS_INDEXABLE, googleBot: { index: IS_INDEXABLE, follow: IS_INDEXABLE, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } };
export function pageMetadata({ title, description, path, image = SEO_CONFIG.images.hero, article, preview = false }: {
  title: string; description: string; path: string; image?: string; preview?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; author?: string };
}): Metadata {
  const fullTitle = title.includes(SEO_CONFIG.name) ? title : `${title} | ${SEO_CONFIG.name}`;
  return { title: { absolute: fullTitle }, description, alternates: { canonical: path }, robots: preview ? { index: false, follow: false } : defaultRobots,
    openGraph: { title: fullTitle, description, url: path, siteName: SEO_CONFIG.name, locale: 'tr_TR', images: [{ url: image, alt: `${title} — Parfum Bahari` }], ...(article ? { type: 'article' as const, publishedTime: article.publishedTime, modifiedTime: article.modifiedTime, authors: [article.author || SEO_CONFIG.name] } : { type: 'website' as const }) },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] } };
}
