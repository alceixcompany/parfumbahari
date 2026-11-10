import type { Product } from '../data/products';

export type ProductCategory = { id: string; name: string };
// Keep the existing stored IDs and URLs; only the customer-facing names change.
export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'erkek', name: 'Bay' },
  { id: 'kadin', name: 'Bayan' },
  { id: 'unisex', name: 'Unisex' },
];
export const normalizeSearch = (value: string) => value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');

export function productClassification(product: Pick<Product, 'name' | 'categoryId'>) {
  const aliases: Record<string, string> = { bay: 'erkek', bayan: 'kadin' };
  const explicit = aliases[product.categoryId || ''] || product.categoryId;
  if (DEFAULT_PRODUCT_CATEGORIES.some(category => category.id === explicit)) return { categoryId: explicit! };
  if (product.categoryId === '') return { categoryId: '' };
  const name = normalizeSearch(product.name);
  const categoryId = /unisex|uniseks/.test(name) ? 'unisex' : /kadin|bayan/.test(name) ? 'kadin' : /erkek|\bbay\b/.test(name) ? 'erkek' : '';
  return { categoryId };
}
