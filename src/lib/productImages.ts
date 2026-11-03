import type { Product } from '../data/products';
import { MEDIA_PATH } from './imageUpload';

// Eight optimized images stay below Firestore's transaction request limit.
export const MAX_PRODUCT_IMAGES = 8;

export function isProductImage(value: string) {
  return MEDIA_PATH.test(value) || /^\/parfum-bahari\/[a-z0-9-]+\.(webp|png|jpg)$/.test(value) || /^https:\/\/[^\s]+$/i.test(value);
}

export function getProductImages(product: Pick<Product, 'image' | 'images'>): string[] {
  // Existing products only have `image`; their current photo remains the cover.
  const images = Array.isArray(product.images) ? product.images : [];
  return [...new Set([product.image, ...images].filter((image): image is string => typeof image === 'string' && isProductImage(image)))].slice(0, MAX_PRODUCT_IMAGES);
}
