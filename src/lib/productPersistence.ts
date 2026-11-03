import { Bytes, doc, runTransaction, type Firestore } from 'firebase/firestore';
import type { Product } from '../data/products';
import { MAX_IMAGE_BYTES, type PreparedImage } from './imageUpload';
import { isProductImage, MAX_PRODUCT_IMAGES } from './productImages';
export { isProductImage } from './productImages';

export type ProductRecord = Product & { brand: string };

// All photos and the product commit together; failed saves leave no partial uploads.
export async function saveProduct(database: Firestore, product: ProductRecord, existingId: string, selected: PreparedImage | PreparedImage[] | null) {
  const slug = product.slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new Error('Geçerli bir bağlantı adı girin.');
  if (!isProductImage(product.image)) throw new Error('Lütfen bir ürün fotoğrafı seçin.');
  const photos = product.images ?? [product.image];
  if (!Array.isArray(photos) || !photos.length || photos.length > MAX_PRODUCT_IMAGES || new Set(photos).size !== photos.length || !photos.every(photo => typeof photo === 'string' && isProductImage(photo)) || !photos.includes(product.image)) throw new Error(`1–${MAX_PRODUCT_IMAGES} fotoğraf ekleyin ve bir kapak seçin.`);
  const images = selected ? Array.isArray(selected) ? selected : [selected] : [];
  if (new Set(images.map(image => image.id)).size !== images.length || images.some(image => !photos.includes(`/api/media/${image.id}`) || !/^[a-f0-9-]{36}$/.test(image.id) || !['image/webp', 'image/jpeg'].includes(image.blob.type) || image.blob.size === 0 || image.blob.size > MAX_IMAGE_BYTES || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width < 1 || image.height < 1 || image.width > 2400 || image.height > 2400)) throw new Error('Fotoğraf geçerli değil. Yeniden seçin.');
  const now = new Date().toISOString();
  const removedFields = new Set(['id', 'category', 'family', 'sizes', 'topNotes', 'heartNotes', 'baseNotes']);
  const content = Object.fromEntries(Object.entries(product).filter(([key]) => !removedFields.has(key)));
  const media = await Promise.all(images.map(async image => ({
    id: image.id, data: Bytes.fromUint8Array(new Uint8Array(await image.blob.arrayBuffer())),
    contentType: image.blob.type,
    width: image.width,
    height: image.height,
    createdAt: now,
  })));
  const location = doc(database, 'products', existingId || slug);
  await runTransaction(database, async transaction => {
    const existing = await transaction.get(location);
    if (!existingId && existing.exists()) throw new Error('Bu bağlantı adı kullanılıyor. Başka bir ad seçin.');
    if (existingId && !existing.exists()) throw new Error('Ürün artık mevcut değil. Listeyi yenileyin.');
    transaction.set(location, { ...content, images: photos, brand: 'parfum-bahari', updatedAt: now, createdAt: existing.exists() ? existing.data().createdAt || now : now });
    for (const { id, ...photo } of media) transaction.set(doc(database, 'media', id), photo);
  });
}
