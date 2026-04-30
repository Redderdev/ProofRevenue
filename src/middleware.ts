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

  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);
  const hasSupabaseToken = cookieNames.some((name) =>
    name === 'sb-access-token' ||
    name === 'sb-refresh-token' ||
    name.endsWith('-auth-token')
  );
  const hasLegacyToken =
    Boolean(request.cookies.get('accessToken')?.value) ||
    Boolean(request.cookies.get('refreshToken')?.value);
  const hasToken = hasSupabaseToken || hasLegacyToken;

  if (isProtectedPath(pathname) && !hasToken) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthPage(pathname) && hasToken) {
    const next = request.nextUrl.searchParams.get('next');
    // Only allow relative paths — reject absolute URLs and protocol-relative URLs (//evil.com)
    const safePath = (next && next.startsWith('/') && !next.startsWith('//')) ? next : '/dashboard';
    return NextResponse.redirect(new URL(safePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
