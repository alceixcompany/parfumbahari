import type { Product } from '../data/products';

export type ProductCategory = { id: string; name: string; parentId: string; order: number; isActive: boolean };
export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = ['Kadın', 'Erkek', 'Unisex'].flatMap((name, index) => {
  const id = ['kadin', 'erkek', 'unisex'][index];
  return [
    { id, name: `${name} Parfüm`, parentId: '', order: index, isActive: true },
    ...['Eau de Parfum', 'Eau de Toilette', 'Parfum & Extrait'].map((name, order) => ({ id: `${id}-${['edp', 'edt', 'extrait'][order]}`, name, parentId: id, order, isActive: true })),
  ];
});

const brands = ['Maison Francis Kurkdjian', 'Yves Saint Laurent', 'Jean Paul Gaultier', 'Narciso Rodriguez', 'Giorgio Armani', 'Carolina Herrera', 'Dolce Gabbana', 'Dolce & Gabbana', 'Parfums de Marly', 'Christian Dior', 'Victoria’s Secret', "Victoria's Secret", 'Calvin Klein', 'Tiziana Terenzi', 'Viktor & Rolf', 'Viktor&Rolf', 'Viktor Rolf', 'Thierry Mugler', 'Salvatore Ferragamo', 'Louis Vuitton', 'By Kilian', 'Paco Rabanne', 'Tom Ford', 'Marc Jacobs', 'Ex Nihilo', 'Hugo Boss', 'Issey Miyake', 'Van Cleef', 'Clive Christian', 'Amouage', 'Azzaro', 'Burberry', 'Bvlgari', 'Chanel', 'Chloe', 'Creed', 'Diesel', 'Dior', 'Ferragamo', 'Givenchy', 'Gucci', 'Guerlain', 'Hermes', 'Initio', 'Jo Malone', 'Kayali', 'Kilian', 'Lacoste', 'Lancome', 'Lattafa', 'Le Labo', 'Mancera', 'Montale', 'Montblanc', 'Nasomatto', 'Nishane', 'Prada', 'Rabanne', 'Roja', 'Valentino', 'Versace', 'Xerjoff'];
export const normalizeSearch = (value: string) => value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');

// Legacy catalogue entries can be filtered without rewriting existing Firebase records.
export function productClassification(product: Pick<Product, 'name' | 'concentration' | 'categoryId' | 'subcategoryId' | 'fragranceBrand'>) {
  const name = normalizeSearch(product.name);
  const categoryId = product.categoryId ?? (/unisex|uniseks|unısex/.test(name) ? 'unisex' : /kadin|bayan/.test(name) ? 'kadin' : /erkek/.test(name) ? 'erkek' : '');
  const concentration = normalizeSearch(`${product.concentration} ${product.name}`);
  const type = (/extrait|\ble parfum\b/.test(concentration) || normalizeSearch(product.concentration).trim() === 'parfum') ? 'extrait' : /\bedp\b|eau de parfum/.test(concentration) ? 'edp' : /\bedt\b|eau de toilette/.test(concentration) ? 'edt' : '';
  const subcategoryId = product.subcategoryId ?? (categoryId && type ? `${categoryId}-${type}` : '');
  const detected = brands.find(brand => name.startsWith(normalizeSearch(brand))) || '';
  const fragranceBrand = product.fragranceBrand ?? detected.replace(/^Christian Dior$/, 'Dior').replace(/^Rabanne$/, 'Paco Rabanne').replace(/^Giorgio Armani$/, 'Armani').replace(/^Viktor.?\s?Rolf$/, 'Viktor & Rolf');
  return { categoryId, subcategoryId, fragranceBrand };
}

export function mergeProductCategories(custom: ProductCategory[]): ProductCategory[] {
  const merged = new Map(DEFAULT_PRODUCT_CATEGORIES.map(category => [category.id, category]));
  custom.forEach(category => merged.set(category.id, category));
  return [...merged.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'tr'));
}

export function availableCategories(categories: ProductCategory[]) {
  const roots = categories.filter(category => category.isActive && !category.parentId);
  const rootIds = new Set(roots.map(category => category.id));
  return categories.filter(category => category.isActive && (!category.parentId || rootIds.has(category.parentId)));
}
