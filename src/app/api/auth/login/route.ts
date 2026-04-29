// POST /api/auth/login - User login with Supabase Auth
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { signInUser } from '@/lib/supabase-auth';
import { consumeLoginAttempt } from '@/lib/rate-limit';

interface LoginRequest {
  email?: string;
  password?: string;
}

/**
 * POST /api/auth/login
 * Security:
 * - Rate-limited by IP (max 5 per 15 minutes)
 * - Generic error messages (no user enumeration)
 * - Session token managed by Supabase Auth in httpOnly cookies
 */
export async function POST(request: NextRequest) {
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
    // Rate limiting
    const rateLimit = await consumeLoginAttempt(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter ?? 60) } }
      );
    }

    // Parse and validate input
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Sign in user
    try {
      const { user } = await signInUser(
        email.toLowerCase().trim(),
        password,
        supabase
      );

      // Create response with session
      const response = NextResponse.json(
        {
          success: true,
          message: 'Logged in successfully',
          user: { id: user.id, email: user.email },
        },
        { status: 200 }
      );

      // Supabase Auth helpers set httpOnly cookies automatically
      console.log(`User logged in: ${user.id} (${user.email})`);

      return response;
    } catch (error: any) {
      console.error('Login error:', error);

      // Generic error message (prevents user enumeration)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Login handler error:', error);

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
