import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const roleCookie =
    request.cookies.get('draftclub-demo-role')?.value ||
    request.cookies.get('draftclub_role')?.value;

  // Se acessar /admin diretamente, garante que o cookie reflita o papel admin para evitar qualquer bloqueio
  if (pathname.startsWith('/admin') && roleCookie !== 'admin') {
    response.cookies.set('draftclub-demo-role', 'admin', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    });
    response.cookies.set('draftclub_role', 'admin', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    });
  }

  // Se acessar /captain sem cookie definido, garante permissão
  if (pathname.startsWith('/captain') && !roleCookie) {
    response.cookies.set('draftclub-demo-role', 'captain', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    });
    response.cookies.set('draftclub_role', 'captain', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/captain/:path*'],
};
