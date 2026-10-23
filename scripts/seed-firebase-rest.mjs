import { existsSync, readFileSync } from 'node:fs';
const envPath = new URL('../.env.local', import.meta.url);
if (existsSync(envPath)) process.loadEnvFile(envPath);
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const flag = process.argv.indexOf('--project');
const confirmedProject = flag >= 0 ? process.argv[flag + 1] : '';
if (!projectId || projectId !== confirmedProject || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) throw new Error('Pass --project with the exact configured Firebase project ID.');
const origin = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const query = `?key=${encodeURIComponent(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)}`;
const headers = { 'Content-Type': 'application/json' };
if (process.env.FIREBASE_ID_TOKEN) headers.Authorization = `Bearer ${process.env.FIREBASE_ID_TOKEN}`;
const starter = JSON.parse(readFileSync(new URL('../src/data/starter-content.json', import.meta.url), 'utf8'));
const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
function encode(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (value === null) return { nullValue: null };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, encode(child)])) } };
}
const entries = Object.entries({ ...starter, products }).flatMap(([collection, records]) => records.map(({ id, ...data }) => ({ collection, id, data: { ...data, brand: 'parfum-bahari' } })));
let added = 0; let skipped = 0;
for (const entry of entries) {
  const url = `${origin}/${entry.collection}/${encodeURIComponent(entry.id)}${query}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (response.ok) { skipped++; continue; }
  if (response.status !== 404 && response.status !== 403) throw new Error(`Cannot inspect ${entry.collection}/${entry.id}: HTTP ${response.status}`);
  // createDocument cannot overwrite an existing record, even when its read is denied.
  const create = await fetch(`${origin}/${entry.collection}${query}&documentId=${encodeURIComponent(entry.id)}`, {
    method: 'POST', headers, body: JSON.stringify({ fields: encode(entry.data).mapValue.fields }), signal: AbortSignal.timeout(10000),
  });
  if (create.status === 409) { skipped++; continue; }
  if (!create.ok) {
    const data = await create.json();
    throw new Error(`Import stopped at ${entry.collection}/${entry.id}: HTTP ${create.status} ${data.error?.message || ''}. Added ${added}; preserved ${skipped}. An authorized Firebase administrator session is required.`);
  }
  added++;
}
console.log(`Parfum Bahari → ${projectId}: ${added} documents added; ${skipped} existing documents preserved.`);
for (const collection of ['products', 'haberler', 'gallery_items', 'gallery_categories']) {
  const response = await fetch(`${origin}:runQuery${query}`, { method: 'POST', headers, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: 'isActive' }, op: 'EQUAL', value: { booleanValue: true } } } } }), signal: AbortSignal.timeout(10000) });
  const rows = await response.json();
  console.log(`${collection}: HTTP ${response.status}, ${Array.isArray(rows) ? rows.filter(row => row.document).length : 0} published records`);
}
