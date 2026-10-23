const assert=require('node:assert/strict'); const fs=require('node:fs'); const path=require('node:path'); const ts=require('typescript'); const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(module,filename)=>{const original=module.require;module.require=function(id){return original.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)+(id.endsWith('.json')?'':'.ts')):id);};module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);};
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID='demo-parfum-bahari';process.env.NEXT_PUBLIC_FIREBASE_API_KEY='test-key';
const {ensureInitialContent}=require('../src/lib/initialContent.ts');
const productCount=JSON.parse(fs.readFileSync(path.join(root,'src/data/products.json'))).length;
const starter=JSON.parse(fs.readFileSync(path.join(root,'src/data/starter-content.json')));
const expected=productCount+Object.values(starter).reduce((n,rows)=>n+rows.length,0);
let markerExists=false;let existing=false;let deny=false;let committed=[];let queries=0;
global.fetch=async(url,options)=>{queries++;assert.equal(options.headers.Authorization,'Bearer local-test-id-token');assert.equal(options.cache,'no-store');const target=String(url);if(target.includes('/admins/parfum-bahari-content-seed-v1'))return Response.json(markerExists?{name:'marker'}:{error:{}},{status:markerExists?200:404});if(target.includes(':commit')){const writes=JSON.parse(options.body).writes;assert(writes.every(w=>w.currentDocument.exists===false),'No writes may overwrite existing or deleted records during initialization.');if(deny)return Response.json({error:{}},{status:403});committed=writes;return Response.json({writeResults:writes.map(()=>({}))});}return Response.json(existing?{name:'existing-record'}:{error:{}},{status:existing?200:404});};
(async()=>{
let result=await ensureInitialContent('local-test-id-token');assert.equal(result.added,expected);assert.equal(committed.length,expected+1);assert.equal(result.initialized,true);
markerExists=true;queries=0;committed=[];result=await ensureInitialContent('local-test-id-token');assert.equal(queries,1);assert.equal(committed.length,0);assert.equal(result.initialized,false);
markerExists=false;existing=true;result=await ensureInitialContent('local-test-id-token');assert.equal(result.added,0);assert.equal(result.skipped,expected);assert.equal(committed.length,1);
existing=false;deny=true;committed=[];await assert.rejects(ensureInitialContent('local-test-id-token'),/aktarılamadı/);assert.equal(committed.length,0);
console.log(`PASS: ${expected} initial records, authenticated requests, insert-only writes, existing-record preservation, one-time marker, deleted-record preservation and permission-denied failure.`);
})().catch(error=>{console.error(error);process.exitCode=1});
