// POST /api/auth/refresh - Deprecated (Supabase manages refresh cookies)
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/refresh
 * Security:
 * - Verifies refresh token against database (can detect replay attacks)
 * - Returns new access token in httpOnly cookie
 * - Prevents token fixation attacks
 * - Detects and revokes token family on replay attempt
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Deprecated endpoint' },
    { status: 410 }
  );
}
