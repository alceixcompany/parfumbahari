import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const base = process.argv[2] || 'http://localhost:3000';
const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url)));
const starter = JSON.parse(readFileSync(new URL('../src/data/starter-content.json', import.meta.url)));
const pages = ['/', '/urun-katalogu', '/hakkimizda', '/haberler', '/galeri', '/gizlilik-politikasi', ...products.map(p=>`/urun-katalogu/${p.slug}`), ...starter.haberler.map(p=>`/haberler/${p.slug}`)];
const names = new Set(); const images = new Set(['/parfum-bahari/hero.webp','/parfum-bahari/hero-trio.webp','/parfum-bahari/logo-wordmark.svg','/parfum-bahari/logo-wordmark.png','/parfum-bahari/icon-pb.svg','/parfum-bahari/icon-pb.png']);
for (const p of products) { assert(!names.has(p.slug), `Duplicate product slug ${p.slug}`); names.add(p.slug); assert(p.images.length > 0 && p.images.includes(p.image)); images.add(p.image); }
for(const row of [...starter.haberler,...starter.gallery_items]) images.add(row.imageUrl);
for (const image of images) assert(existsSync(new URL(`../public${image}`,import.meta.url)), `Missing local image ${image}`);
const links = new Set(); let schemas=0;
for (const path of pages) {
 const response=await fetch(base+path); assert.equal(response.status,200,`${path} HTTP status`);
 const html=await response.text(); assert.match(html,/<html[^>]*lang="tr"/); assert.equal((html.match(/<h1\b/g)||[]).length,1,`${path}: one H1`);
 assert.match(html,/<title>[^<]*Parfum Bahari[^<]*<\/title>/); assert.match(html,/<meta name="description"/); assert.match(html,/<link rel="canonical"/);
 assert(!/<a\b[^>]*href="\/iletisim/.test(html), `${path}: removed contact link`);
 if(path==='/urun-katalogu'||path.startsWith('/urun-katalogu/')) { assert(!/BOYUT SEÇİN|Üst notalar|Kalp notalar|Dip notalar|Koku ailesi|Kimin için\?/.test(html), `${path}: obsolete product controls`); }
 if(path==='/') { assert(html.includes('hero-trio.webp')); assert(!/class="hero-copy"|class="hero-seal"|class="hero-image-caption"/.test(html)); }
 assert(!/Light Barbershop|Centereach|Sunny Life|Gümüşoğlu|whitebarbar/.test(html),`${path}: stale brand content`);
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){JSON.parse(match[1]);schemas++;}
 for(const match of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)){const path=match[1].replaceAll('&amp;','&');if(path.startsWith('/'))links.add(path);}
}
for(const path of [...links].filter(p=>!pages.includes(p))) assert.equal((await fetch(base+path)).status,200,`Broken link ${path}`);
for(const image of images) assert.equal((await fetch(base+image)).status,200,`Image request ${image}`);
for(const path of ['/urun-katalogu/no-such-fragrance','/haberler/no-such-story','/missing-page','/iletisim']) assert.equal((await fetch(base+path)).status,404,`Missing route ${path}`);
for(const [old,target] of Object.entries({'/about':'/hakkimizda','/services':'/urun-katalogu','/gallery':'/galeri','/blog':'/haberler','/contact':'/urun-katalogu','/hizmetlerimiz':'/urun-katalogu'})) {const r=await fetch(base+old,{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),target);}
const sitemap=await (await fetch(base+'/sitemap.xml')).text(); for(const p of products) assert(sitemap.includes('/urun-katalogu/'+p.slug));
const manifest=await (await fetch(base+'/manifest.webmanifest')).json();assert.equal(manifest.name,'Parfum Bahari');assert.equal(manifest.lang,'tr');
const admin = await fetch(base+'/admin', {redirect:'manual'});
assert([200,307].includes(admin.status));
if(admin.status===307) assert.equal(new URL(admin.headers.get('location'),base).pathname,'/admin/login');
assert.equal((await fetch(base+'/api/admin/session')).status,401);
console.log(`PASS: ${pages.length} public pages, ${links.size} internal link targets, ${images.size} local assets, ${schemas} valid JSON-LD blocks, redirects, missing routes, sitemap, manifest and admin boundary and removed contact page.`);
