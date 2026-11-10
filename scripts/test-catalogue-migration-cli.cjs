const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const root = path.resolve(__dirname, '..');
const project = 'demo-catalogue-migration';
const prefix = `projects/${project}/databases/(default)/documents/products/`;
const value = data => typeof data === 'string' ? { stringValue: data } : typeof data === 'boolean' ? { booleanValue: data } : { arrayValue: { values: data.map(value) } };
const fields = data => Object.fromEntries(Object.entries(data).map(([key, data]) => [key, value(data)]));
const original = { name: prefix+'legacy', updateTime: '2026-01-01T00:00:00.000000Z', fields: fields({ name:'Gerçek Kadın Parfüm',slug:'legacy',brand:'parfum-bahari',isActive:false,image:'/parfum-bahari/rose.webp',images:['/parfum-bahari/rose.webp'],story:'Korunacak gerçek açıklama',subcategoryId:'kadin-edp',fragranceBrand:'Eski marka alanı' }) };
const other = { name: prefix+'foreign', updateTime: '2026-01-01T00:00:00.000000Z', fields: fields({ brand:'other-brand', name:'Dokunulmayacak kayıt' }) };
let documents = structuredClone([original, other]); let commits = 0;
(async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'parfum-migration-test-'));
  const server = http.createServer(async (request, response) => {
    const chunks=[]; for await (const chunk of request) chunks.push(chunk);
    const body=JSON.parse(Buffer.concat(chunks).toString());
    const send=(status,data)=>{response.writeHead(status,{'Content-Type':'application/json'});response.end(JSON.stringify(data));};
    assert.equal(request.headers.authorization,'Bearer migration-test-only');
    if (request.url.endsWith(':runQuery')) return send(200,documents.map(document=>({document})));
    assert(request.url.endsWith(':commit')); commits++;
    for(const write of body.writes){const doc=documents.find(doc=>doc.name===write.update.name);if(!doc||doc.updateTime!==write.currentDocument.updateTime)return send(412,{error:{status:'FAILED_PRECONDITION',message:'Concurrent edit preserved'}});}
    const results=[];
    for(const write of body.writes){const doc=documents.find(doc=>doc.name===write.update.name);for(const key of write.updateMask.fieldPaths){if(Object.hasOwn(write.update.fields,key))doc.fields[key]=write.update.fields[key];else delete doc.fields[key];}doc.updateTime=`2026-01-01T00:00:${String(commits).padStart(2,'0')}.000000Z`;results.push({updateTime:doc.updateTime});}
    return send(200,{writeResults:results});
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');
  async function run(args=[],extra={}){
    const child=spawn(process.execPath,['--require',path.join(root,'scripts/fixtures/migration-proxy.cjs'),path.join(root,'scripts/migrate-catalogue.cjs'),'--project',project,'--out-dir',temporary,...args],{cwd:root,env:{...process.env,NEXT_PUBLIC_FIREBASE_PROJECT_ID:project,NEXT_PUBLIC_FIREBASE_API_KEY:'test-only',FIREBASE_ID_TOKEN:'migration-test-only',GOOGLE_APPLICATION_CREDENTIALS:path.join(temporary,'missing-adc.json'),PARFUM_MIGRATION_TEST_PROXY:`http://127.0.0.1:${server.address().port}`,...extra},stdio:['ignore','pipe','pipe']});
    let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);const [code]=await once(child,'exit');return {code,output};
  }
  try {
    const preview=await run();assert.equal(preview.code,0,preview.output);const report=JSON.parse(preview.output);assert.equal(report.inspected,1);assert.equal(report.changes,1);assert.equal(report.scope,'all-products');assert.equal(fs.statSync(report.plan).mode&0o777,0o600);assert.equal(commits,0);
    documents[0].updateTime='2026-01-01T00:00:01.000000Z';
    const stale=await run(['--apply','--plan',report.plan]);assert.notEqual(stale.code,0);assert(stale.output.includes('412'));assert.deepEqual(documents[0].fields,original.fields);
    documents[0].updateTime=original.updateTime;
    const applied=await run(['--apply','--plan',report.plan]);assert.equal(applied.code,0,applied.output);const receipt=JSON.parse(applied.output);assert.equal(receipt.applied,1);assert.equal(documents[0].fields.categoryId.stringValue,'kadin');assert.equal(documents[0].fields.isActive.booleanValue,false);assert.equal(documents[0].fields.subcategoryId,undefined);assert.equal(documents[0].fields.fragranceBrand,undefined);assert.deepEqual(documents[0].fields.images,original.fields.images);assert.deepEqual(documents[1],other);
    const repeated=await run();assert.equal(repeated.code,0,repeated.output);assert.equal(JSON.parse(repeated.output).changes,0,'Migration is idempotent.');
    const restored=await run(['--rollback',receipt.receipt]);assert.equal(restored.code,0,restored.output);assert.deepEqual(documents[0].fields,original.fields);assert.deepEqual(documents[1],other);
    const corrupt=JSON.parse(fs.readFileSync(report.plan));corrupt.records[0].set.categoryId='erkek';const invalid=path.join(temporary,'corrupt.json');fs.writeFileSync(invalid,JSON.stringify(corrupt));const before=commits;assert.notEqual((await run(['--apply','--plan',invalid])).code,0);assert.equal(commits,before);
    assert.notEqual((await run(['--apply','--plan',report.plan],{FIREBASE_ID_TOKEN:''})).code,0);assert.equal(commits,before);
    console.log('PASS: actual migration CLI dry-run, private backups, atomic concurrency preconditions, idempotent update masks, exact rollback, foreign-brand isolation, checksum and missing-credential rejection. No live Firebase writes.');
  } finally { server.close();fs.rmSync(temporary,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
