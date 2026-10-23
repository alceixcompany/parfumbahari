import { CONTENT_SOURCE } from '@/lib/contentSource';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

export async function GET() {
  if (CONTENT_SOURCE === 'static') return NextResponse.json({ authenticated: false }, { status: 401 });
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = sessionSecret ? await verifyAdminSessionToken(token, sessionSecret) : false;
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}
