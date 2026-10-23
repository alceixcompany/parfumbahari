// Trusted server-side setup only. Uses the operator's Application Default Credentials.
// Does not create users, passwords, credential files, or modify existing roles.
import { existsSync } from 'node:fs';
import { initializeApp, applicationDefault, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
const envPath = new URL('../.env.local', import.meta.url);
if (existsSync(envPath)) process.loadEnvFile(envPath);
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const flag = process.argv.indexOf('--uid'); const uid = flag >= 0 ? process.argv[flag + 1] : '';
if (!projectId || !uid) throw new Error('Set NEXT_PUBLIC_FIREBASE_PROJECT_ID and pass --uid <existing Firebase Authentication UID>. Configure trusted Application Default Credentials first.');
const app = initializeApp({ credential: applicationDefault(), projectId });
try {
  const user = await getAuth(app).getUser(uid);
  if (!user.email || user.disabled) throw new Error('The selected Authentication account must be active and have an email.');
  const role = getFirestore(app).doc(`admins/${user.uid}`); const current = await role.get();
  if (current.exists) {
    if (current.data().isAdmin !== true) throw new Error('An existing non-admin role was preserved. Review its permissions in the console.');
    console.log('Existing administrator role preserved.');
  } else {
    await role.create({ email: user.email, displayName: user.displayName || 'Parfum Bahari Yönetici', isAdmin: true, createdAt: new Date().toISOString() });
    console.log(`Missing administrator role created in project ${projectId}. No account or password was changed.`);
  }
} finally { await deleteApp(app); }
