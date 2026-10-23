import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_SOURCE, FIREBASE_CONFIGURED } from '@/lib/contentSource';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  // Static studio only renders public seed data; it never renders protected admin children.
  if (CONTENT_SOURCE === 'static' || !FIREBASE_CONFIGURED) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = secret ? await verifyAdminSessionToken(token, secret) : false;

  if (!authenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
