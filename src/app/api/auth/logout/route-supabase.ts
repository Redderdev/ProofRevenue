// POST /api/auth/logout - User logout with Supabase Auth
import { NextRequest, NextResponse } from 'next/server';
import { signOutUser } from '@/lib/supabase-auth';

/**
 * POST /api/auth/logout
 * Security:
 * - Clears Supabase session
 * - Revokes all refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Sign out
    await signOutUser();

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookies
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    console.log('User logged out');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );

    // Ensure cookies are cleared even on error
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  }
}
