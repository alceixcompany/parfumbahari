import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';
import { CONTENT_SOURCE } from '@/lib/contentSource';
import { isPrimaryAdmin } from '@/lib/adminIdentity';
import { invalidatePublicContent, PUBLIC_COLLECTIONS, type PublicCollection } from '@/lib/contentCache';

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (CONTENT_SOURCE !== 'firebase' || !secret || !await verifyAdminSessionToken(session, secret)) return NextResponse.json({ message: 'Yönetici oturumu gerekli.' }, { status: 401 });
  const token = request.headers.get('authorization')?.match(/^Bearer (\S{1,10000})$/)?.[1];
  if (!token) return NextResponse.json({ message: 'Firebase oturumu gerekli.' }, { status: 401 });
  let collections: PublicCollection[];
  try {
    const body = await request.json();
    if (!Array.isArray(body.collections) || !body.collections.length || body.collections.length > 4 || body.collections.some((item: unknown) => typeof item !== 'string' || !PUBLIC_COLLECTIONS.includes(item as PublicCollection))) throw new Error('Invalid collection');
    collections = [...new Set<PublicCollection>(body.collections)];
  } catch { return NextResponse.json({ message: 'Geçersiz içerik isteği.' }, { status: 400 }); }
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !key) return NextResponse.json({ message: 'Firebase yapılandırması eksik.' }, { status: 503 });
  try {
    const identity = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }), cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const data = await identity.json() as { users?: Array<{ localId: string; disabled?: boolean }> };
    const user = data.users?.[0];
    if (!identity.ok || !user?.localId || user.disabled) return NextResponse.json({ message: 'Firebase oturumu doğrulanamadı.' }, { status: 401 });
    // Bind the Firebase identity to the signed session; stale or revoked roles cannot flush caches.
    const sessionUid = session!.split('.').slice(0, -2).join('.');
    if (user.localId !== sessionUid) return NextResponse.json({ message: 'Oturum eşleşmiyor.' }, { status: 403 });
    if (!isPrimaryAdmin(user.localId)) {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/admins/${encodeURIComponent(user.localId)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
      const role = await response.json() as { fields?: { isAdmin?: { booleanValue?: boolean } } };
      if (!response.ok || role.fields?.isAdmin?.booleanValue !== true) return NextResponse.json({ message: 'Yönetici yetkisi gerekli.' }, { status: 403 });
    }
    invalidatePublicContent(collections);
    return NextResponse.json({ refreshed: true }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ message: 'Site önbelleği yenilenemedi.' }, { status: 503 }); }
}
