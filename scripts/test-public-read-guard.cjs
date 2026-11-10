const assert = require('node:assert/strict');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => {
  const ts = require('typescript');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
const { guardPublicRead, PublicReadError } = require('../src/lib/publicReadGuard.ts');
(async () => {
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-guard-coalescing';
  let calls = 0; let finish;
  const deferred = new Promise(resolve => { finish = resolve; });
  const reads = Array.from({ length: 20 }, () => guardPublicRead('products:list', async () => { calls++; return deferred; }));
  assert.equal(calls, 1);
  finish(['published']);
  assert.deepEqual(await Promise.all(reads), Array(20).fill(['published']));
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-guard-quota';
  calls = 0;
  const quotaRead = () => guardPublicRead('products:list', async () => { calls++; throw new PublicReadError(429); });
  await assert.rejects(quotaRead(), error => error.status === 429);
  await assert.rejects(guardPublicRead('media:another', async () => { calls++; return 'unexpected'; }), error => error.status === 503);
  assert.equal(calls, 1);
  const now = Date.now;
  try {
    Date.now = () => now() + 61_000;
    assert.equal(await guardPublicRead('products:list', async () => { calls++; return 'recovered'; }), 'recovered');
    assert.equal(calls, 2);
  } finally { Date.now = now; }
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-guard-not-found';
  await assert.rejects(guardPublicRead('media:missing', async () => { throw new PublicReadError(404); }));
  assert.equal(await guardPublicRead('media:valid', async () => 'ok'), 'ok');
  console.log('PASS: 20 simultaneous misses coalesce, quota failure pauses reads for 60 seconds, recovery works and missing media does not block valid data.');
})().catch(error => { console.error(error); process.exitCode = 1; });
