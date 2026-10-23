import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { CONTENT_SOURCE, FIREBASE_CONFIGURED } from './contentSource';
const enabled = CONTENT_SOURCE === 'firebase' && FIREBASE_CONFIGURED;
const app = enabled ? getApps().find(item => item.name === 'parfum-bahari') || initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, 'parfum-bahari') : undefined;
function unavailable<T extends object>(): T { return new Proxy({} as T, { get() { throw new Error('Firebase kapalı. Veri kaynağını ve Firebase yapılandırmasını kontrol edin.'); } }); }
export const auth = app ? getAuth(app) : unavailable<Auth>();
export const db = app ? getFirestore(app) : unavailable<Firestore>();
export const storage = app ? getStorage(app) : unavailable<FirebaseStorage>();
export default app;
