import { ensureInitialContent } from '@/lib/initialContent';
import { isPrimaryAdmin } from '@/lib/adminIdentity';
import { CONTENT_SOURCE } from '@/lib/contentSource';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_DURATION_SECONDS, createAdminSessionToken } from '@/lib/adminSession';
export async function POST(request: Request) {
  if (CONTENT_SOURCE === 'static') return NextResponse.json({ message: 'Statik modda yönetici girişi kapalı.' }, { status: 503 });
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!apiKey || !projectId || !secret) return NextResponse.json({ message: 'Yönetici oturumu yapılandırılmamış.' }, { status: 503 });
  let idToken: unknown;
  try { ({ idToken } = await request.json()); } catch { return NextResponse.json({ message: 'Geçersiz giriş isteği.' }, { status: 400 }); }
  if (typeof idToken !== 'string' || !idToken || idToken.length > 10000) return NextResponse.json({ message: 'Geçerli Firebase oturumu gerekli.' }, { status: 401 });
  try {
    const identity = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const data = await identity.json() as { users?: Array<{ localId: string; email: string; disabled?: boolean }> };
    const user = data.users?.[0];
    if (!identity.ok || !user?.localId || !user.email || user.disabled) return NextResponse.json({ message: 'Oturum doğrulanamadı. Yeniden giriş yapın.' }, { status: 401 });
    let displayName = 'Parfum Bahari Yönetici';
    if (!isPrimaryAdmin(user.localId)) {
      const membership = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodeURIComponent(user.localId)}`, { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const admin = await membership.json() as { fields?: { isAdmin?: { booleanValue: boolean }; displayName?: { stringValue: string } } };
      if (!membership.ok || admin.fields?.isAdmin?.booleanValue !== true) return NextResponse.json({ message: 'Bu hesabın yönetici yetkisi bulunmuyor.' }, { status: 403 });
      displayName = admin.fields.displayName?.stringValue || displayName;
    }
    let setupMessage = '';
    let setupError = false;
    if (isPrimaryAdmin(user.localId)) {
      try { const imported = await ensureInitialContent(idToken); if (imported.initialized) setupMessage = `${imported.added} başlangıç içeriği Firebase’e aktarıldı; ${imported.skipped} mevcut kayıt korundu.`; }
      catch (error) { setupMessage = error instanceof Error ? error.message : 'İçerik kurulumu tamamlanamadı.'; setupError = true; }
    }
    const response = NextResponse.json({ user: { uid: user.localId, email: user.email, displayName, setupMessage, setupError, isStaticAdmin: false, isDatabaseAdmin: true } });
    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(user.localId, secret), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: ADMIN_SESSION_DURATION_SECONDS });
    return response;
  } catch { return NextResponse.json({ message: 'Firebase bağlantısı kurulamadı. Lütfen yeniden deneyin.' }, { status: 503 }); }
}
