const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require('@next/env').loadEnvConfig(root);
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { planCatalogueMigration } = require('../src/lib/catalogueMigration.ts');
const { unpack } = require('../src/lib/firestoreValues.ts');
const value = flag => { const index = process.argv.indexOf(flag); return index < 0 ? '' : process.argv[index + 1] || ''; };
const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apply = process.argv.includes('--apply');
const rollback = value('--rollback');
const digest = data => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
const encode = item => typeof item === 'string' ? { stringValue: item } : Array.isArray(item) ? { arrayValue: { values: item.map(encode) } } : (() => { throw new Error('Unsupported patch value'); })();
const savePrivate = (filename, data) => { fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 }); fs.writeFileSync(filename, JSON.stringify(data, null, 2) + '\n', { mode: 0o600, flag: 'wx' }); };

(async () => {
  if (!project || value('--project') !== project) throw new Error('Pass --project with the exact configured Firebase project ID.');
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('Firebase API configuration is missing.');
  let bearer = process.env.FIREBASE_ID_TOKEN;
  const adc = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(os.homedir(), '.config/gcloud/application_default_credentials.json');
  if (!bearer && (fs.existsSync(adc) || process.argv.includes('--adc'))) {
    const { applicationDefault } = require('firebase-admin/app');
    bearer = (await applicationDefault().getAccessToken()).access_token;
  }
  if (!bearer && process.argv.includes('--firebase-cli')) {
    let modulePath;
    try { modulePath = require.resolve('firebase-tools/lib/auth'); } catch {
      for (const directory of (process.env.PATH || '').split(path.delimiter)) {
        const executable = path.join(directory, 'firebase');
        if (fs.existsSync(executable)) {
          const candidate = path.resolve(path.dirname(fs.realpathSync(executable)), '../auth.js');
          if (fs.existsSync(candidate)) { modulePath = candidate; break; }
        }
      }
    }
    if (!modulePath) throw new Error('Firebase CLI is not installed.');
    const cli = require(modulePath);
    const account = cli.getProjectDefaultAccount(root);
    if (!account?.tokens) throw new Error('Sign in to Firebase CLI with an existing account authorized for this project.');
    bearer = account.tokens.access_token;
    if (!bearer || !account.tokens.expires_at || account.tokens.expires_at < Date.now() + 60000) bearer = (await cli.getAccessToken(account.tokens.refresh_token, account.tokens.scopes)).access_token;
  }
  if ((apply || rollback) && !bearer) throw new Error('No write credential is configured. Use an existing authorized Firebase ID token via the environment, trusted Application Default Credentials, or --firebase-cli; do not paste credentials into chat.');
  const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
  const headers = { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) };
  async function request(suffix, body) {
    const response = await fetch(`${base}${suffix}?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    if (!response.ok) {
      const error = (Array.isArray(data) ? data.find(row => row.error)?.error : data.error) || {};
      throw new Error(`Firestore HTTP ${response.status}: ${error.status || ''} ${error.message || ''}. No automatic retry was performed.`);
    }
    return data;
  }
  const folder = path.resolve(value('--out-dir') || path.join(root, 'artifacts/catalogue-migration'));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (!apply && !rollback) {
    const filters = [{ fieldFilter: { field: { fieldPath: 'brand' }, op: 'EQUAL', value: { stringValue: 'parfum-bahari' } } }, ...(!bearer ? [{ fieldFilter: { field: { fieldPath: 'isActive' }, op: 'EQUAL', value: { booleanValue: true } } }] : [])];
    const rows = await request(':runQuery', { structuredQuery: { from: [{ collectionId: 'products' }], where: { compositeFilter: { op: 'AND', filters } } } });
    if (!Array.isArray(rows) || rows.some(row => row.error)) throw new Error('Product snapshot is unavailable. No plan or writes were created.');
    const records = rows.flatMap(({ document }) => {
      if (!document) return [];
      const data = Object.fromEntries(Object.entries(document.fields || {}).map(([key, child]) => [key, unpack(child)]));
      if (data.brand !== 'parfum-bahari') return [];
      const id = document.name.split('/').pop();
      return [{ id, before: document, ...planCatalogueMigration(id, data) }];
    });
    const plan = { version: 1, project, createdAt: new Date().toISOString(), scope: bearer ? 'all-products' : 'published-only', records };
    const filename = path.join(folder, `plan-${stamp}.json`);
    savePrivate(filename, { ...plan, checksum: digest(plan) });
    const changes = records.filter(record => Object.keys(record.set).length || record.remove.length);
    console.log(JSON.stringify({ mode: 'dry-run', project, scope: plan.scope, inspected: records.length, changes: changes.length, unchanged: records.length - changes.length, review: records.filter(record => record.review.length).map(record => ({ id: record.id, issues: record.review })), plan: filename }, null, 2));
    return;
  }
  if (rollback) {
    const receipt = JSON.parse(fs.readFileSync(path.resolve(rollback), 'utf8'));
    const plan = JSON.parse(fs.readFileSync(receipt.plan, 'utf8'));
    const { checksum, ...payload } = plan;
    if (receipt.project !== project || plan.project !== project || digest(payload) !== checksum || receipt.planChecksum !== checksum) throw new Error('Backup project or checksum mismatch.');
    const writes = receipt.applied.map(item => {
      const record = plan.records.find(record => record.id === item.id);
      if (!record || !item.updateTime || record.before.name !== `projects/${project}/databases/(default)/documents/products/${item.id}`) throw new Error('Backup record or project path is invalid.');
      const fields = [...new Set([...Object.keys(record.set), ...record.remove, 'updatedAt'])];
      return { update: { name: record.before.name, fields: Object.fromEntries(fields.filter(field => Object.hasOwn(record.before.fields, field)).map(field => [field, record.before.fields[field]])) }, updateMask: { fieldPaths: fields }, currentDocument: { updateTime: item.updateTime } };
    });
    if (!writes.length || writes.length > 400) throw new Error('Rollback requires 1–400 backed-up changes.');
    const result = await request(':commit', { writes });
    savePrivate(path.join(folder, `rollback-${stamp}.json`), { project, receipt: path.resolve(rollback), result });
    console.log(`Restored ${writes.length} records. URLs, photos and unrelated fields were preserved.`);
    return;
  }
  const filename = path.resolve(value('--plan') || '');
  if (!value('--plan')) throw new Error('--apply requires a previously reviewed --plan file.');
  const plan = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const { checksum, ...payload } = plan;
  if (plan.version !== 1 || plan.project !== project || digest(payload) !== checksum) throw new Error('Plan project, version or checksum mismatch.');
  const changes = plan.records.filter(record => Object.keys(record.set).length || record.remove.length);
  if (!changes.length) { console.log('No changes are necessary.'); return; }
  if (changes.length > 400) throw new Error('More than 400 changes: split and review the plan before applying; no partial batches were written.');
  const now = new Date().toISOString();
  const writes = changes.map(record => {
    if (!record.before.updateTime || record.before.name !== `projects/${project}/databases/(default)/documents/products/${record.id}`) throw new Error('Snapshot precondition or product path is invalid.');
    const original = Object.fromEntries(Object.entries(record.before.fields).map(([key, child]) => [key, unpack(child)]));
    const expected = planCatalogueMigration(record.id, original);
    if (JSON.stringify(expected) !== JSON.stringify({ set: record.set, remove: record.remove, review: record.review })) throw new Error('The stored patch does not match the conservative migration rules.');
    return { update: { name: record.before.name, fields: Object.fromEntries(Object.entries({ ...record.set, updatedAt: now }).map(([key, child]) => [key, encode(child)])) }, updateMask: { fieldPaths: [...Object.keys(record.set), ...record.remove, 'updatedAt'] }, currentDocument: { updateTime: record.before.updateTime } };
  });
  const result = await request(':commit', { writes });
  const receiptFile = path.join(folder, `applied-${stamp}.json`);
  savePrivate(receiptFile, { project, plan: filename, planChecksum: checksum, appliedAt: now, applied: changes.map((record, index) => ({ id: record.id, updateTime: result.writeResults[index].updateTime })) });
  console.log(JSON.stringify({ project, applied: changes.length, remainingReview: plan.records.filter(record => record.review.length).length, receipt: receiptFile, note: 'External migration writes become visible after the public cache refresh (up to its normal one-hour interval).' }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
