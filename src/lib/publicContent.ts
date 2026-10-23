import { cache } from 'react';
import { unstable_rethrow } from 'next/navigation';
import starter from '@/data/starter-content.json';
import { products, type Product } from '@/data/products';
import type { BlogPost } from '@/data/blogPosts';
import { CONTENT_SOURCE } from './contentSource';
export type GalleryContent = { id: string; src: string; title: string; tag: string; description: string; order: number; featured: boolean; illustrative: boolean };
type Value = { stringValue?: string; booleanValue?: boolean; integerValue?: string; doubleValue?: number; timestampValue?: string; arrayValue?: { values?: Value[] }; mapValue?: { fields?: Record<string, Value> } };
function unpack(value: Value): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(unpack);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue?.fields || {}).map(([k, v]) => [k, unpack(v)]));
  return null;
}
export const readPublishedCollection = cache(async (collection: string): Promise<Array<Record<string, unknown> & { id: string }>> => {
  if (CONTENT_SOURCE === 'static') {
    const data = collection === 'products' ? products : starter[collection as keyof typeof starter] || [];
    return data.filter(item => item.isActive).map(item => ({ ...item }));
  }
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !apiKey) return [];
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: 'isActive' }, op: 'EQUAL', value: { booleanValue: true } } } } }), cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(String(response.status));
    const rows = await response.json() as Array<{ document?: { name: string; fields?: Record<string, Value> } }>;
    return rows.flatMap(({ document }) => document ? [{ ...Object.fromEntries(Object.entries(document.fields || {}).map(([k, v]) => [k, unpack(v)])), id: document.name.split('/').pop() || '' }] : []).filter(item => (item as Record<string, unknown>).brand === 'parfum-bahari');
  } catch (error) {
    unstable_rethrow(error);
    console.warn(`Published ${collection} content is temporarily unavailable.`);
    return []; // Hidden/deleted cloud records must never reappear from static fallback.
  }
});
export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  const rows = await readPublishedCollection('products');
  return rows.filter(item => typeof item.slug === 'string' && typeof item.name === 'string' && Array.isArray(item.sizes) && Array.isArray(item.topNotes) && Array.isArray(item.heartNotes) && Array.isArray(item.baseNotes)).map(item => ({ ...item, image: safeImage(String(item.image || '')) }) as Product).sort((a, b) => a.order - b.order);
});
export const getPublishedProduct = cache(async (slug: string) => (await getPublishedProducts()).find(item => item.slug === slug));
export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => (await readPublishedCollection('haberler')).filter(item => typeof item.title === 'string' && typeof item.slug === 'string').map(item => ({
  modifiedDate: typeof item.updatedAt === 'string' ? item.updatedAt : undefined, slug: String(item.slug), title: String(item.title), category: String(item.category || 'Koku Günlüğü'), readTime: String(item.readTime || '3 dk okuma'), excerpt: String(item.excerpt || item.description || ''), image: safeImage(String(item.imageUrl || item.image || '')), publishedDate: String(item.publishedDate || item.createdAt || '').slice(0, 10), publishedAt: String(item.publishedDate || item.createdAt || '').slice(0, 10), paragraphs: String(item.content || '').split(/\n\s*\n/).filter(Boolean), tips: [], featured: item.featured === true, illustrative: item.illustrative === true, author: 'Parfum Bahari',
})).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)));
export const getPublishedPost = cache(async (slug: string) => (await getPublishedPosts()).find(post => post.slug === slug));
export async function getPublishedGallery(): Promise<GalleryContent[]> {
  const [items, categories] = await Promise.all([readPublishedCollection('gallery_items'), readPublishedCollection('gallery_categories')]);
  const activeCategories = new Map(categories.map(category => [category.id, String(category.name)]));
  return items.filter(item => activeCategories.has(String(item.categoryId))).map(item => ({ id: item.id, src: safeImage(String(item.imageUrl || '')), title: String(item.title || ''), tag: activeCategories.get(String(item.categoryId)) || '', description: String(item.description || ''), order: Number(item.order || 0), featured: item.isFeatured === true, illustrative: item.illustrative === true })).sort((a, b) => a.order - b.order);
}
export function safeImage(src: string) {
  return /^\/api\/media\/[a-f0-9-]{36}$/.test(src) || /^\/parfum-bahari\/[a-z0-9-]+\.(webp|png|jpg)$/.test(src) || /^https:\/\//i.test(src) ? src : '/parfum-bahari/hero.webp';
}
