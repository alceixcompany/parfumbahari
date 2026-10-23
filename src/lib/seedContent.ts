import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import starter from '@/data/starter-content.json';
import { products } from '@/data/products';
export async function importStarterContent() {
  const entries = Object.entries({ ...starter, products: products.map(p => ({ ...p, brand: 'parfum-bahari' })) }).flatMap(([collection, records]) => records.map(({ id, ...data }) => ({ ref: doc(db, collection, id), data })));
  return runTransaction(db, async transaction => {
    const existing = await Promise.all(entries.map(entry => transaction.get(entry.ref)));
    let added = 0;
    entries.forEach((entry, index) => { if (!existing[index].exists()) { transaction.set(entry.ref, { ...entry.data, updatedAt: new Date().toISOString() }); added++; } });
    return { added, skipped: entries.length - added };
  });
}
