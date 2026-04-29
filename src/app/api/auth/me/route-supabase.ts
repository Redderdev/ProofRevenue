// GET /api/auth/me - Get current authenticated user with Supabase Auth
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getCurrentUser } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Security:
 * - Protected route (requires valid Supabase session)
 * - Returns current user info
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    // Get current user
    const user = await getCurrentUser(supabase);

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
