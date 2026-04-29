// POST /api/auth/logout - User logout with Supabase Auth
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { signOutUser } from '@/lib/supabase-auth';

/**
 * POST /api/auth/logout
 * Security:
 * - Clears Supabase session
 * - Revokes all refresh tokens
 */
export async function POST() {
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
    // Sign out
    await signOutUser(supabase);

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    console.log('User logged out');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
    return response;
  }
}
