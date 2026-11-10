import { cache } from 'react';
import starter from '@/data/starter-content.json';
import { products, type Product } from '@/data/products';
import type { BlogPost } from '@/data/blogPosts';
import { CONTENT_SOURCE } from './contentSource';
import { unpack, type FirestoreValue } from './firestoreValues';
import { normalizeProduct } from './normalizeProduct';
import { DEFAULT_PRODUCT_CATEGORIES, type ProductCategory } from './productCategories';
import { cachedPublicRead, type PublicCollection } from './contentCache';
import { PublicReadError } from './publicReadGuard';

export type GalleryContent = { id: string; src: string; title: string; tag: string; description: string; order: number; featured: boolean; illustrative: boolean };
type ContentRow = Record<string, unknown> & { id: string };
type QueryOptions = { slug?: string; limit?: number };

async function readPublishedQuery(collection: PublicCollection, options: QueryOptions = {}): Promise<ContentRow[]> {
  if (CONTENT_SOURCE === 'static') {
    const rows = (collection === 'products' ? products : starter[collection] || []).filter(item => item.isActive).map(item => ({ ...item } as ContentRow));
    const selected = options.slug ? rows.filter(item => item.slug === options.slug) : rows;
    return options.limit ? selected.slice(0, options.limit) : selected;
  }
  return cachedPublicRead(collection, JSON.stringify(options), async () => {
    const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!project || !apiKey) throw new PublicReadError(503);
    const filters = [
      { fieldFilter: { field: { fieldPath: 'isActive' }, op: 'EQUAL', value: { booleanValue: true } } },
      { fieldFilter: { field: { fieldPath: 'brand' }, op: 'EQUAL', value: { stringValue: 'parfum-bahari' } } },
      ...(options.slug ? [{ fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: options.slug } } }] : []),
    ];
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { compositeFilter: { op: 'AND', filters } }, ...(options.limit ? { limit: options.limit } : {}) } }),
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new PublicReadError(response.status);
    const rows = await response.json() as Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> }; error?: unknown }>;
    if (!Array.isArray(rows) || rows.some(row => row.error)) throw new PublicReadError(503);
    // Only successful, published data reaches the shared cache. Failures never become empty results.
    return rows.flatMap(({ document }) => document ? [{ ...Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, unpack(value)])), id: document.name.split('/').pop() || '' } as ContentRow] : []).filter(item => item.brand === 'parfum-bahari' && item.isActive === true);
  });
}

export const readPublishedCollection = cache((collection: PublicCollection) => readPublishedQuery(collection));
export const getPublishedProducts = cache(async (): Promise<Product[]> => (await readPublishedCollection('products')).filter(item => typeof item.slug === 'string' && typeof item.name === 'string').map(normalizeProduct).sort((a, b) => a.order - b.order));
export const getPublishedProduct = cache(async (slug: string): Promise<Product | undefined> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 150) return undefined;
  const row = (await readPublishedQuery('products', { slug, limit: 1 }))[0];
  return row && typeof row.name === 'string' ? normalizeProduct(row) : undefined;
});
export const getRelatedProducts = cache(async (excludedId: string): Promise<Product[]> => (await readPublishedQuery('products', { limit: 4 })).filter(item => item.id !== excludedId && typeof item.name === 'string' && typeof item.slug === 'string').slice(0, 3).map(normalizeProduct));

function toPost(item: ContentRow): BlogPost {
  return {
    modifiedDate: typeof item.updatedAt === 'string' ? item.updatedAt : undefined, slug: String(item.slug), title: String(item.title), category: String(item.category || 'Blog'), readTime: String(item.readTime || '3 dk okuma'), excerpt: String(item.excerpt || item.description || ''), image: safeImage(String(item.imageUrl || item.image || '')), publishedDate: String(item.publishedDate || item.createdAt || '').slice(0, 10), publishedAt: String(item.publishedDate || item.createdAt || '').slice(0, 10), paragraphs: String(item.content || '').split(/\n\s*\n/).filter(Boolean), tips: [], featured: item.featured === true, illustrative: item.illustrative === true, author: 'Parfum Bahari',
  };
}
export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => (await readPublishedCollection('haberler')).filter(item => typeof item.title === 'string' && typeof item.slug === 'string').map(toPost).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)));
export const getPublishedPost = cache(async (slug: string): Promise<BlogPost | undefined> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 150) return undefined;
  const row = (await readPublishedQuery('haberler', { slug, limit: 1 }))[0];
  return row && typeof row.title === 'string' ? toPost(row) : undefined;
});
export const getRelatedPosts = cache(async (excludedSlug: string): Promise<BlogPost[]> => (await readPublishedQuery('haberler', { limit: 4 })).filter(item => item.slug !== excludedSlug && typeof item.title === 'string' && typeof item.slug === 'string').slice(0, 3).map(toPost));

export async function getPublishedGallery(): Promise<GalleryContent[]> {
  const [items, categories] = await Promise.all([readPublishedCollection('gallery_items'), readPublishedCollection('gallery_categories')]);
  const activeCategories = new Map(categories.map(category => [category.id, String(category.name)]));
  return items.filter(item => activeCategories.has(String(item.categoryId))).map(item => ({ id: item.id, src: safeImage(String(item.imageUrl || '')), title: String(item.title || ''), tag: activeCategories.get(String(item.categoryId)) || '', description: String(item.description || ''), order: Number(item.order || 0), featured: item.isFeatured === true, illustrative: item.illustrative === true })).sort((a, b) => a.order - b.order);
}
export function safeImage(src: string) {
  return /^\/api\/media\/[a-f0-9-]{36}$/.test(src) || /^\/parfum-bahari\/[a-z0-9-]+\.(webp|png|jpg)$/.test(src) || /^https:\/\//i.test(src) ? src : '/parfum-bahari/hero.webp';
}
export const getPublishedProductCategories = cache(async (): Promise<ProductCategory[]> => DEFAULT_PRODUCT_CATEGORIES);
