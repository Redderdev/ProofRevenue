// Authentication middleware for protected routes
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Middleware to protect API routes
 * Usage: Add to route handler before accessing user data
 */
export async function withAuth(request: NextRequest, handler: Function) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(accessToken);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Attach user to request (create new request with user data)
    const requestWithUser = new NextRequest(request, {
      headers: new Headers(request.headers),
    });

    // Store userId in headers for handler to use
    (requestWithUser as any).userId = decoded.userId;
    (requestWithUser as any).user = decoded;

    // Call handler with authenticated request
    return handler(requestWithUser);
  } catch (error: any) {
    console.error('Auth middleware error:', error);

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Middleware to check if user is already authenticated
 * Redirects to dashboard if logged in
 */
export function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return false;
  }

  const decoded = verifyToken(accessToken);
  return !!decoded && !!decoded.userId;
}
