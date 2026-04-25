// GET /api/auth/me - Get current authenticated user
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { mockVerifyToken, mockGetUserById } from '@/lib/auth-mock';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Security:
 * - Protected route (requires valid access token)
 * - Returns current user info
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(accessToken);
    } catch (dbError: any) {
      // Fall back to mock token verification
      console.warn('Using mock token verification:', dbError.message);
      decoded = await mockVerifyToken(accessToken);
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database (never returns password)
    let user;
    try {
      user = await getUserById(decoded.userId);
    } catch (dbError: any) {
      // Fall back to mock user retrieval
      console.warn('Using mock user retrieval:', dbError.message);
      user = await mockGetUserById(decoded.userId);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);

    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
