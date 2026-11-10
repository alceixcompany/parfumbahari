import type { Product } from '../data/products';
import { getProductImages } from './productImages';

// Firestore is schemaless. Normalize legacy records before rendering admin inputs or images.
export function normalizeProduct(item: Record<string, unknown> & { id: string }): Product {
  const text = (key: string) => typeof item[key] === 'string' ? item[key] as string : '';
  const images = getProductImages({ image: text('image'), images: Array.isArray(item.images) ? item.images : [] });
  return {
    id: item.id, slug: text('slug') || item.id, name: text('name') || 'İsimsiz parfüm',
    story: text('story') || text('description'), concentration: text('concentration'),
    mood: text('mood'), season: text('season'), badge: text('badge'),
    image: images[0] || '/parfum-bahari/hero.webp', images,
    isActive: item.isActive === true, featured: item.featured === true,
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : 0,
    ...(typeof item.categoryId === 'string' ? { categoryId: item.categoryId } : {}),
  };
}
