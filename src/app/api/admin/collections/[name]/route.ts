import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';
import { CONTENT_SOURCE } from '@/lib/contentSource';
import { unpack, type FirestoreValue } from '@/lib/firestoreValues';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!['products', 'product_categories'].includes(name)) return NextResponse.json({ message: 'Koleksiyon bulunamadı.' }, { status: 404 });
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (CONTENT_SOURCE !== 'firebase' || !secret || !await verifyAdminSessionToken(token, secret)) return NextResponse.json({ message: 'Yeniden yönetici girişi yapın.' }, { status: 401 });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ') || authorization.length > 10007) return NextResponse.json({ message: 'Firebase oturumu gerekli.' }, { status: 401 });
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !key) return NextResponse.json({ message: 'Firebase yapılandırması eksik.' }, { status: 503 });
  try {
    // Forward the user's Firebase token. Firestore rules still authorize every read.
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authorization },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: name }] } }), cache: 'no-store', signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return NextResponse.json({ message: response.status === 403 ? 'Erişim reddedildi. Firebase yönetici yetkisini ve yayınlanmış Firestore kurallarını kontrol edin.' : 'Ürün verileri yüklenemedi. Lütfen yeniden deneyin.' }, { status: [401, 403].includes(response.status) ? response.status : 503 });
    const rows = await response.json() as Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> } }>;
    const items = rows.flatMap(({ document }) => document ? [{ ...Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, unpack(value)])), id: document.name.split('/').pop() || '' }] : []).filter(item => (item as Record<string, unknown>).brand === 'parfum-bahari');
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ message: 'Firebase bağlantısı zaman aşımına uğradı. Listeyi yeniden yükleyin.' }, { status: 503 });
  }
}
