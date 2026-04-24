// POST /api/auth/logout - User logout
import { NextRequest, NextResponse } from 'next/server';
import { revokeAllRefreshTokens, verifyToken } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Security:
 * - Revokes all refresh tokens (logout all devices option available)
 * - Clears httpOnly cookies
 * - Protected route (requires valid access token)
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Verify token is still valid
    const decoded = verifyToken(accessToken);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Revoke all refresh tokens for this user (logout all devices)
    await revokeAllRefreshTokens(decoded.userId);

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all auth cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('tokenFamily');

    // Audit log
    console.log(`User logged out: ${decoded.userId}`);

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    // Clear cookies anyway
    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('tokenFamily');

    return response;
  }
}
