import { revalidateTag, unstable_cache } from 'next/cache';
import { guardPublicRead } from './publicReadGuard';

export const PUBLIC_COLLECTIONS = ['products', 'haberler', 'gallery_items', 'gallery_categories'] as const;
export type PublicCollection = typeof PUBLIC_COLLECTIONS[number];
export const PUBLIC_CACHE_SECONDS = 3600;
export const MEDIA_CACHE_SECONDS = 365 * 24 * 60 * 60;
export const contentTag = (collection: string) => `parfum-bahari-public:${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'static'}:${collection}`;

// Next's Data Cache is shared by requests; React.cache alone only deduplicates one render.
export function cachedPublicRead<T>(collection: PublicCollection | 'media', key: string, read: () => Promise<T>, seconds = PUBLIC_CACHE_SECONDS) {
  return unstable_cache(
    () => guardPublicRead(`${collection}:${key}`, read),
    ['parfum-bahari-public-v3', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'static', collection, key],
    { revalidate: seconds, tags: [contentTag(collection)] },
  )();
}

export function invalidatePublicContent(collections: readonly PublicCollection[]) {
  for (const collection of new Set(collections)) revalidateTag(contentTag(collection), { expire: 0 });
}
