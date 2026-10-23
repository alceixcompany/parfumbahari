import starter from '@/data/starter-content.json';
import { products } from '@/data/products';

type Value = { stringValue?: string; booleanValue?: boolean; integerValue?: string; doubleValue?: number; arrayValue?: { values: Value[] }; mapValue?: { fields: Record<string, Value> } };
function encode(value: unknown): Value {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, encode(child)])) } };
}
export async function ensureInitialContent(idToken: string) {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !apiKey) throw new Error('Firebase yapılandırması eksik.');
  const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` };
  const options = { headers, cache: 'no-store' as const, signal: AbortSignal.timeout(12000) };
  const markerPath = 'admins/parfum-bahari-content-seed-v1';
  const marker = await fetch(`${base}/${markerPath}?key=${apiKey}`, options);
  if (marker.ok) return { added: 0, skipped: 0, initialized: false };
  if (marker.status !== 404) throw new Error('Firestore kuralları yönetici hesabına erişim vermiyor. Kuralları yayınlayıp yeniden deneyin.');
  const entries = Object.entries({ ...starter, products }).flatMap(([collection, records]) => records.map(({ id, ...data }) => ({ path: `${collection}/${id}`, data: { ...data, brand: 'parfum-bahari' } })));
  const snapshots = await Promise.all(entries.map(async entry => {
    const response = await fetch(`${base}/${entry.path}?key=${apiKey}`, { ...options, signal: AbortSignal.timeout(12000) });
    if (!response.ok && response.status !== 404) throw new Error('Başlangıç içerikleri okunamadı. Firestore kurallarını kontrol edin.');
    return response.ok;
  }));
  const writes = entries.flatMap((entry, index) => snapshots[index] ? [] : [{ update: { name: `${base.replace('https://firestore.googleapis.com/v1/', '')}/${entry.path}`, fields: encode(entry.data).mapValue!.fields }, currentDocument: { exists: false } }]);
  const added = writes.length;
  writes.push({ update: { name: `${base.replace('https://firestore.googleapis.com/v1/', '')}/${markerPath}`, fields: encode({ kind: 'initial-content', completedAt: new Date().toISOString() }).mapValue!.fields }, currentDocument: { exists: false } });
  const result = await fetch(`${base}:commit?key=${apiKey}`, { ...options, method: 'POST', body: JSON.stringify({ writes }), signal: AbortSignal.timeout(15000) });
  if (!result.ok) {
    if (result.status === 409) { const done = await fetch(`${base}/${markerPath}?key=${apiKey}`, options); if (done.ok) return { added: 0, skipped: entries.length, initialized: false }; }
    throw new Error('Başlangıç içeriği aktarılamadı. Mevcut kayıtların üzerine yazılmadı.');
  }
  return { added, skipped: entries.length - added, initialized: true };
}
