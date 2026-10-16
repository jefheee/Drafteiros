import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie =
    request.cookies.get('draftclub-demo-role')?.value ||
    request.cookies.get('draftclub_role')?.value;
  const sbAccessToken = request.cookies.get('sb-access-token')?.value;

  // Proteção da área Admin
  if (pathname.startsWith('/admin')) {
    if (roleCookie !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteção da área do Capitão
  if (pathname.startsWith('/captain')) {
    if (roleCookie !== 'captain' && roleCookie !== 'admin' && !sbAccessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/captain/:path*'],
};
