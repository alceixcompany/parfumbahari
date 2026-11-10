import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const base = process.argv.find(arg => /^https?:/.test(arg)) || 'http://localhost:3000';
const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url)));
const starter = JSON.parse(readFileSync(new URL('../src/data/starter-content.json', import.meta.url)));
const names = new Set();
const images = new Set(['/parfum-bahari/hero.webp', '/parfum-bahari/hero-branded.webp', '/parfum-bahari/hero-trio.webp', '/parfum-bahari/story-naxos.png', '/parfum-bahari/story-erba-pura.png', '/parfum-bahari/logo-horizontal-v2.png']);
for (const product of products) {
  assert(!names.has(product.slug), `Duplicate product slug ${product.slug}`); names.add(product.slug);
  assert(product.images.length > 0 && product.images.includes(product.image)); images.add(product.image);
}
for (const row of [...starter.haberler, ...starter.gallery_items]) images.add(row.imageUrl);
for (const image of images) assert(existsSync(new URL(`../public${image}`, import.meta.url)), `Missing local image ${image}`);
const catalogueHtml = await (await fetch(base + '/urun-katalogu')).text();
const schemasFrom = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
const list = schemasFrom(catalogueHtml).find(schema => schema['@type'] === 'ItemList');
assert(list, 'Catalogue ItemList exists');
const productPaths = list.itemListElement.map(item => new URL(item.url).pathname);
const blogHtml = await (await fetch(base + '/haberler')).text();
const articlePaths = [...new Set([...blogHtml.matchAll(/href="(\/haberler\/[^"?#]+)"/g)].map(match => match[1]))];
const pages = ['/', '/urun-katalogu', '/hakkimizda', '/haberler', '/galeri', '/gizlilik-politikasi', ...(process.argv.includes('--all-products') ? productPaths : productPaths.slice(0, 6)), ...articlePaths];
const links = new Set(); let schemas = 0;
for (const path of pages) {
  const response = await fetch(base + path); assert.equal(response.status, 200, `${path} HTTP status`);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="tr"/); assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: one H1`);
  assert.match(html, /<title>[^<]*Parfum Bahari[^<]*<\/title>/); assert.match(html, /<meta name="description"/); assert.match(html, /<link rel="canonical"/);
  assert(!/<a\b[^>]*href="\/iletisim/.test(html), `${path}: removed contact link`);
  if (path === '/urun-katalogu') { assert(!html.includes('catalogue-subcategory')); assert(!html.includes('catalogue-brand')); assert(html.includes('Bayan')); assert(html.includes('Bay')); assert(html.includes('Unisex')); }
  if (path === '/urun-katalogu' || path.startsWith('/urun-katalogu/')) assert(!/class="(?:size-selector|note-pyramid|product-family-control)"/.test(html), `${path}: obsolete product controls`);
  if (path === '/') { assert(html.includes('story-naxos.png')); assert(html.includes('story-erba-pura.png')); assert(!html.includes('Parfümümü nasıl saklamalıyım?')); assert(html.includes('hero-branded.webp')); assert(html.includes('hero-slider-dots')); assert(!html.includes('Önceki slayt')); assert(html.includes('/parfum-bahari/logo')); }
  if (path.startsWith('/urun-katalogu/')) { assert(!/class="detail-subtitle"|class="detail-description"/.test(html)); assert(html.includes('fotoğrafı büyüt')); }
  assert(!/Light Barbershop|Centereach|Sunny Life|Gümüşoğlu|whitebarbar/.test(html), `${path}: stale brand content`);
  schemas += schemasFrom(html).length;
  for (const match of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)) { const href = match[1].replaceAll('&amp;', '&'); if (href.startsWith('/')) links.add(href); }
}
// Product links are sampled above; the catalogue schema enumerates every active record.
for (const path of [...links].filter(path => !pages.includes(path) && !path.startsWith('/urun-katalogu/'))) assert.equal((await fetch(base + path)).status, 200, `Broken link ${path}`);
for (const image of images) assert.equal((await fetch(base + image)).status, 200, `Image request ${image}`);
for (const path of ['/urun-katalogu/no-such-fragrance', '/haberler/no-such-story', '/missing-page', '/iletisim']) assert.equal((await fetch(base + path)).status, 404, `Missing route ${path}`);
for (const [old, target] of Object.entries({ '/about': '/hakkimizda', '/services': '/urun-katalogu', '/gallery': '/galeri', '/blog': '/haberler', '/contact': '/urun-katalogu', '/hizmetlerimiz': '/urun-katalogu' })) { const response = await fetch(base + old, { redirect: 'manual' }); assert.equal(response.status, 308); assert.equal(response.headers.get('location'), target); }
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
for (const path of productPaths) assert(sitemap.includes(path), `Sitemap contains ${path}`);
const manifest = await (await fetch(base + '/manifest.webmanifest')).json(); assert.equal(manifest.name, 'Parfum Bahari'); assert.equal(manifest.lang, 'tr');
const admin = await fetch(base + '/admin', { redirect: 'manual' }); assert([200, 307].includes(admin.status));
if (admin.status === 307) assert.equal(new URL(admin.headers.get('location'), base).pathname, '/admin/login');
assert.equal((await fetch(base + '/api/admin/session')).status, 401);
assert.equal((await fetch(base + '/api/admin/collections/products')).status, 401);
console.log(`PASS: ${pages.length} pages, ${productPaths.length} catalogue/sitemap entries, ${images.size} local assets, ${schemas} JSON-LD objects, category links, slider, redirects and admin boundaries.`);
