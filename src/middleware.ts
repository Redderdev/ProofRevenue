import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter — best-effort per serverless instance, no external deps
const certPageRequests = new Map<string, { count: number; resetAt: number }>();
const CERT_RATE_LIMIT = 30;     // requests per window
const CERT_RATE_WINDOW = 60_000; // 1 minute

function checkCertRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = certPageRequests.get(ip);

  if (!entry || now > entry.resetAt) {
    certPageRequests.set(ip, { count: 1, resetAt: now + CERT_RATE_WINDOW });
    return true;
  }
  if (entry.count >= CERT_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

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

  // Rate-limit public certificate pages to prevent DB flooding
  if (pathname.startsWith('/c/')) {
    const allowed = checkCertRateLimit(getIp(request));
    if (!allowed) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
      });
    }
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
