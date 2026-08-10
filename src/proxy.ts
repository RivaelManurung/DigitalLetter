import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Pagar pertama untuk /dashboard. Sengaja ringan: hanya verifikasi tanda
 * tangan cookie, tanpa menyentuh database (middleware jalan di edge).
 * Otorisasi sebenarnya tetap dilakukan ulang di tiap Server Action.
 */

const COOKIE = 'dl_session';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  let valid = false;

  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      valid = true;
    } catch {
      valid = false;
    }
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !valid) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === '/login' && valid) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
