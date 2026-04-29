// GET /api/auth/me - Get current authenticated user with Supabase Auth
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Security:
 * - Protected route (requires valid Supabase session)
 * - Returns current user info
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
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
