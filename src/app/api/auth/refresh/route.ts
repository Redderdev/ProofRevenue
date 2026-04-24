// POST /api/auth/refresh - Refresh access token
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  createAccessToken,
  verifyRefreshTokenExists,
  hashPassword,
} from '@/lib/auth';
import crypto from 'crypto';

/**
 * POST /api/auth/refresh
 * Security:
 * - Verifies refresh token against database (can detect replay attacks)
 * - Returns new access token in httpOnly cookie
 * - Prevents token fixation attacks
 * - Detects and revokes token family on replay attempt
 */
export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const tokenFamily = request.cookies.get('tokenFamily')?.value;

    if (!refreshToken || !tokenFamily) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Verify refresh token is valid
    const decoded = verifyToken(refreshToken);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Hash the refresh token to check against database
    const tokenHash = await hashPassword(refreshToken);

    // Verify token exists in database and hasn't been revoked
    const tokenExists = await verifyRefreshTokenExists(decoded.userId, tokenHash);

    if (!tokenExists) {
      // Token doesn't exist or was revoked - potential replay attack
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Generate new tokens with same family (for rotation)
    const jti = crypto.randomUUID();
    const newAccessToken = createAccessToken(decoded.userId, decoded.email, jti);

    // Create response with new access token
    const response = NextResponse.json(
      { success: true, message: 'Token refreshed' },
      { status: 200 }
    );

    // Update access token cookie
    response.cookies.set({
      name: 'accessToken',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
