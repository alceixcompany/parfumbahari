const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
if (!global.crypto) global.crypto = require('node:crypto').webcrypto;
const { createAdminSessionToken } = require('../src/lib/adminSession.ts');
const mediaId = '11111111-1111-4111-8111-111111111111';
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'src/data/products.json'), 'utf8')).map(item => ({ ...item, brand: 'parfum-bahari' }));
let quota = false; let reads = 0; let queries = []; let mediaReads = 0;
const encode = value => typeof value === 'string' ? { stringValue: value } : typeof value === 'boolean' ? { booleanValue: value } : typeof value === 'number' ? { integerValue: String(value) } : Array.isArray(value) ? { arrayValue: { values: value.map(encode) } } : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, encode(child)])) } };
let app;
(async () => {
  assert(fs.existsSync(path.join(root, '.next/BUILD_ID')), 'Run npm run build first.');
  const proxy = http.createServer(async (request, response) => {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const send = (data, status = 200) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(data)); };
    if (request.url.includes('accounts:lookup')) return send({ users: [{ localId: 'cache-test-admin' }] });
    if (request.url.includes(`/media/${mediaId}`)) {
      mediaReads++;
      return send({ fields: { data: { bytesValue: fs.readFileSync(path.join(root, 'public/parfum-bahari/fleur.webp')).toString('base64') }, contentType: { stringValue: 'image/webp' } } });
    }
    if (!request.url.endsWith('documents:runQuery')) return send({ error: 'Unexpected test request' }, 500);
    const query = JSON.parse(Buffer.concat(chunks).toString()).structuredQuery;
    queries.push(query);
    if (quota) return send([{ error: { status: 'RESOURCE_EXHAUSTED' } }], 429);
    const collection = query.from[0].collectionId;
    const filters = query.where?.compositeFilter?.filters || [query.where];
    let rows = collection === 'products' ? fixture : [];
    assert(filters.some(item => item?.fieldFilter?.field.fieldPath === 'isActive'));
    assert(filters.some(item => item?.fieldFilter?.field.fieldPath === 'brand'));
    for (const { fieldFilter: filter } of filters) {
      const value = filter.value.stringValue ?? filter.value.booleanValue;
      rows = rows.filter(row => row[filter.field.fieldPath] === value);
    }
    if (query.limit) rows = rows.slice(0, query.limit);
    reads += Math.max(1, rows.length);
    send(rows.length ? rows.map(({ id, ...row }) => ({ document: { name: `projects/test/databases/(default)/documents/${collection}/${id}`, fields: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, encode(value)])) } })) : [{}]);
  });
  proxy.listen(0, '127.0.0.1'); await once(proxy, 'listening');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'parfum-cache-integration-'));
  try {
    // Isolate Next's real on-disk cache so fake data can never enter the workspace cache.
    fs.cpSync(path.join(root, '.next'), path.join(temporary, '.next'), { recursive: true, filter: file => !['cache', 'dev'].includes(path.relative(path.join(root, '.next'), file).split(path.sep)[0]) });
    fs.copyFileSync(path.join(root, 'package.json'), path.join(temporary, 'package.json'));
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(temporary, 'node_modules'));
    fs.symlinkSync(path.join(root, 'public'), path.join(temporary, 'public'));
    const secret = 'integration-only-secret-012345678901234567890123456789';
    let logs = '';
    app = spawn(process.execPath, ['--require', path.join(root, 'scripts/fixtures/cache-proxy.cjs'), path.join(root, 'node_modules/next/dist/bin/next'), 'start', temporary, '--hostname', '127.0.0.1', '--port', '0'], {
      cwd: temporary,
      env: { ...process.env, ADMIN_SESSION_SECRET: secret, FIREBASE_PRIMARY_ADMIN_UID: 'cache-test-admin', PARFUM_CACHE_TEST_PROXY: `http://127.0.0.1:${proxy.address().port}`, NEXT_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    app.stdout.on('data', chunk => { logs += chunk; }); app.stderr.on('data', chunk => { logs += chunk; });
    const base = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Server startup timeout: ${logs.slice(-1500)}`)), 20000);
      const onData = () => { const match = logs.match(/Local:\s+(http:\/\/127\.0\.0\.1:\d+)/); if (match && logs.includes('Ready')) { clearTimeout(timeout); app.stdout.off('data', onData); resolve(match[1]); } };
      app.stdout.on('data', onData); app.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited ${code}: ${logs.slice(-1500)}`)); });
    });
    const get = async route => { const response = await fetch(base + route); const html = await response.text(); return { status: response.status, html }; };
    const slug = fixture[0].slug;
    assert.equal((await get(`/urun-katalogu/${slug}`)).status, 200);
    assert.equal(queries.length, 2, 'Cold detail should query one product and four suggestions only.');
    assert.deepEqual(queries.map(query => query.limit).sort(), [1, 4]);
    assert(reads <= 5, 'A detail request must never read the catalogue.');
    const afterFirst = queries.length;
    for (let index = 0; index < 10; index++) assert.equal((await get(`/urun-katalogu/${slug}`)).status, 200);
    assert.equal(queries.length, afterFirst, 'Warm detail requests reuse the real shared Data Cache.');
    assert.equal((await get(`/urun-katalogu/${fixture[1].slug}`)).status, 200);
    assert.equal(queries.length, afterFirst + 1, 'Other details reuse the bounded suggestions.');
    assert.equal((await get('/urun-katalogu')).status, 200);
    const afterCatalogue = queries.length;
    for (let index = 0; index < 5; index++) assert.equal((await get('/urun-katalogu')).status, 200);
    assert.equal(queries.length, afterCatalogue, 'Repeated catalogue requests must not read Firestore.');
    assert.equal((await fetch(base + `/api/media/${mediaId}`)).status, 200);
    assert.equal((await fetch(base + `/api/media/${mediaId}`)).status, 200);
    assert.equal(mediaReads, 1, 'Immutable photo bytes are shared across requests.');
    const revalidate = async authorized => fetch(base + '/api/admin/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorized ? { Cookie: `parfum_bahari_admin_session=${await createAdminSessionToken('cache-test-admin', secret)}`, Authorization: 'Bearer test-only-token' } : {}) }, body: JSON.stringify({ collections: ['products'] }) });
    assert.equal((await revalidate(false)).status, 401);
    fixture[0].name = 'Updated cached perfume';
    assert.equal((await revalidate(true)).status, 200);
    assert((await get(`/urun-katalogu/${slug}`)).html.includes('Updated cached perfume'), 'Admin mutation must expire public caches immediately.');
    fixture[0].isActive = false;
    assert.equal((await revalidate(true)).status, 200);
    assert.equal((await get(`/urun-katalogu/${slug}`)).status, 404, 'A hidden product must not survive cache invalidation.');
    quota = true;
    assert.equal((await revalidate(true)).status, 200);
    const beforeQuota = queries.length;
    assert.equal((await get('/urun-katalogu')).status, 500);
    assert.equal((await get('/urun-katalogu')).status, 500);
    assert.equal(queries.length, beforeQuota + 1, 'Quota errors must back off instead of retrying each visitor request.');
    console.log('PASS: real production Next Data Cache: cold detail ≤5 document reads; 10 warm details + 5 warm catalogues add zero reads; media is cached; authorized invalidation updates/hides products; quota errors pause upstream reads. No live Firebase calls.');
  } finally {
    if (app && app.exitCode === null) { app.kill('SIGTERM'); await Promise.race([once(app, 'exit'), new Promise(resolve => setTimeout(() => { app.kill('SIGKILL'); resolve(); }, 5000))]); }
    fs.rmSync(temporary, { recursive: true, force: true });
    proxy.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
