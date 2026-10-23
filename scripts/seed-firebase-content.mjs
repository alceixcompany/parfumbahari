import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore, runTransaction, terminate } from 'firebase/firestore';
const envPath = new URL('../.env.local', import.meta.url);
if (existsSync(envPath)) process.loadEnvFile(envPath);
const env = process.env;
const project = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!project || !env.NEXT_PUBLIC_FIREBASE_API_KEY || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) throw new Error('Set the new Firebase project keys and an existing ADMIN_EMAIL / ADMIN_PASSWORD in your ignored local environment.');
const starter = JSON.parse(readFileSync(new URL('../src/data/starter-content.json', import.meta.url), 'utf8'));
const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const app = initializeApp({ apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: project });
const auth = getAuth(app); const db = getFirestore(app);
try {
  const { user } = await signInWithEmailAndPassword(auth, env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  const admin = await getDoc(doc(db, 'admins', user.uid));
  if (!admin.exists() || admin.data().isAdmin !== true) throw new Error('This account has no administrator role. Create the first role through the trusted console or provisioning helper.');
  const entries = Object.entries({ ...starter, products }).flatMap(([collection, records]) => records.map(({ id, ...data }) => ({ ref: doc(db, collection, id), data: { ...data, brand: 'parfum-bahari' } })));
  const added = await runTransaction(db, async transaction => {
    const existing = await Promise.all(entries.map(entry => transaction.get(entry.ref))); let count = 0;
    entries.forEach((entry, i) => { if (!existing[i].exists()) { transaction.set(entry.ref, entry.data); count++; } }); return count;
  });
  console.log(`Parfum Bahari: ${added} new documents added to ${project}; ${entries.length - added} existing documents preserved.`);
} finally { await signOut(auth); await terminate(db); await deleteApp(app); }
