import { Bytes, doc, runTransaction, type Firestore } from 'firebase/firestore';
import type { Product } from '../data/products';
import { MAX_IMAGE_BYTES, MEDIA_PATH, type PreparedImage } from './imageUpload';

export type ProductRecord = Product & { brand: string };

export function isProductImage(value: string) {
  return MEDIA_PATH.test(value) || /^\/parfum-bahari\/[a-z0-9-]+\.(webp|png|jpg)$/.test(value) || /^https:\/\/[^\s]+$/i.test(value);
}

// The image and product commit together. Failed saves and cancellations never leave uploads behind.
export async function saveProduct(database: Firestore, product: ProductRecord, existingId: string, image: PreparedImage | null) {
  const slug = product.slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new Error('Geçerli bir bağlantı adı girin.');
  if (!isProductImage(product.image)) throw new Error('Lütfen bir ürün fotoğrafı seçin.');
  if (image && (product.image !== `/api/media/${image.id}` || !/^[a-f0-9-]{36}$/.test(image.id) || !['image/webp', 'image/jpeg'].includes(image.blob.type) || image.blob.size === 0 || image.blob.size > MAX_IMAGE_BYTES)) throw new Error('Fotoğraf geçerli değil. Yeniden seçin.');
  const now = new Date().toISOString();
  const content = Object.fromEntries(Object.entries(product).filter(([key]) => key !== 'id'));
  const media = image ? {
    data: Bytes.fromUint8Array(new Uint8Array(await image.blob.arrayBuffer())),
    contentType: image.blob.type,
    width: image.width,
    height: image.height,
    createdAt: now,
  } : null;
  const location = doc(database, 'products', existingId || slug);
  await runTransaction(database, async transaction => {
    const existing = await transaction.get(location);
    if (!existingId && existing.exists()) throw new Error('Bu bağlantı adı kullanılıyor. Başka bir ad seçin.');
    if (existingId && !existing.exists()) throw new Error('Ürün artık mevcut değil. Listeyi yenileyin.');
    transaction.set(location, { ...content, brand: 'parfum-bahari', updatedAt: now, createdAt: existing.exists() ? existing.data().createdAt || now : now });
    if (image && media) transaction.set(doc(database, 'media', image.id), media);
  });
}
