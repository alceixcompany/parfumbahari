import { normalizeSearch } from './productCategories';
import { isProductImage, MAX_PRODUCT_IMAGES } from './productImages';

export type CatalogueMigration = {
  set: Record<string, string | string[]>;
  remove: string[];
  review: string[];
};

function storedCategory(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = normalizeSearch(value.trim());
  if (/^(unisex|uniseks)(?:$|[\s-])/.test(normalized)) return 'unisex';
  if (/^(kadin|bayan)(?:$|[\s-])/.test(normalized)) return 'kadin';
  if (/^(erkek|bay)(?:$|[\s-])/.test(normalized)) return 'erkek';
  return undefined;
}

// Conservative, insert/patch-only adaptation. Never invent product names, claims or photographs.
export function planCatalogueMigration(id: string, record: Record<string, unknown>): CatalogueMigration {
  const result: CatalogueMigration = { set: {}, remove: [], review: [] };
  if (record.brand !== 'parfum-bahari') return result;
  const name = typeof record.name === 'string' ? normalizeSearch(record.name) : '';
  const fromName = /\b(unisex|uniseks)\b/.test(name) ? 'unisex' : (() => {
    const female = /\b(kadin|bayan)\b/.test(name);
    const male = /\b(erkek|bay)\b/.test(name);
    return female === male ? undefined : female ? 'kadin' : 'erkek';
  })();
  const existing = storedCategory(record.categoryId);
  const category = existing || storedCategory(record.category) || fromName;
  if (category && record.categoryId !== category) result.set.categoryId = category;
  if (!category) result.review.push('Kategori kesin olarak belirlenemedi; Bay/Bayan/Unisex elle seçilmeli.');
  if (existing && fromName && existing !== fromName) result.review.push('Mevcut kategori ile ürün adındaki kategori farklı; mevcut seçim korundu.');
  if (typeof record.name !== 'string' || !record.name.trim()) result.review.push('Ürün adı eksik; otomatik ad oluşturulmadı.');
  if (typeof record.slug !== 'string' || !record.slug) {
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 100) result.set.slug = id;
    else result.review.push('Bağlantı adı eksik; URL değiştirilmeden elle incelenmeli.');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) || record.slug.length > 100) {
    result.review.push('Bağlantı adı yeni düzenleyici sınırlarına uymuyor; mevcut URL korundu.');
  }
  if ((typeof record.story !== 'string' || !record.story.trim()) && typeof record.description === 'string' && record.description.trim()) result.set.story = record.description;

  const cover = typeof record.image === 'string' && isProductImage(record.image) ? record.image : undefined;
  const photos = Array.isArray(record.images) ? record.images : [];
  if (record.images != null && !Array.isArray(record.images)) {
    result.review.push('Fotoğraf alanı liste değil; özgün bilgi korundu.');
  } else if (photos.some(photo => typeof photo !== 'string' || !isProductImage(photo))) {
    result.review.push('Fotoğraf listesinde tanınmayan kayıt var; özgün fotoğraf bilgileri korundu.');
  } else {
    const valid = [...new Set(photos as string[])];
    if (cover && !valid.includes(cover)) valid.unshift(cover);
    if (!valid.length) result.review.push('Geçerli ürün fotoğrafı bulunamadı; temsilî görsel atanmadı.');
    else if (valid.length > MAX_PRODUCT_IMAGES) result.review.push('Fotoğraf sayısı sekizden fazla; liste kesilmedi.');
    else {
      if (!cover) result.set.image = valid[0];
      if (!Array.isArray(record.images) || JSON.stringify(record.images) !== JSON.stringify(valid)) result.set.images = valid;
    }
  }
  for (const field of ['subcategoryId', 'fragranceBrand']) if (Object.hasOwn(record, field)) result.remove.push(field);
  return result;
}
