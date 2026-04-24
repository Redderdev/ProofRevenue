import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/connect', '/checkout'];
const authPages = ['/auth/signin', '/auth/signup'];

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPage(pathname: string): boolean {
  return authPages.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const hasToken =
    Boolean(request.cookies.get('accessToken')?.value) ||
    Boolean(request.cookies.get('refreshToken')?.value);

  if (isProtectedPath(pathname) && !hasToken) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthPage(pathname) && hasToken) {
    const next = request.nextUrl.searchParams.get('next');
    return NextResponse.redirect(new URL(next || '/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
