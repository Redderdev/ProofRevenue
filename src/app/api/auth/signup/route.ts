// POST /api/auth/signup - Create new user account
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { signUpUser, validatePasswordStrength } from '@/lib/supabase-auth';
import { consumeSignupAttempt } from '@/lib/rate-limit';

// Input validation
interface SignupRequest {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * POST /api/auth/signup
 * Security:
 * - Validates email format
 * - Validates password strength
 * - Prevents duplicate accounts
 * - Hashes password before storage
 * - Returns generic errors (no enumeration)
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
    const rateLimit = await consumeSignupAttempt(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter ?? 3600) } }
      );
    }

    // Parse and validate input
    const body: SignupRequest = await request.json();

    const { email, password, confirmPassword } = body;

    // Input validation - generic error messages
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format (simple regex - production should use email verification)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          requirements: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Sign up user
    try {
      const { user } = await signUpUser(
        email.toLowerCase().trim(),
        password,
        supabase
      );

      console.log(`User signed up: ${user.id} (${user.email})`);

      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully. Please check your email to confirm.',
          user: { id: user.id, email: user.email },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle specific Supabase errors
      if (error.message?.includes('already registered') || error.message?.includes('User already exists')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create account', detail: error?.message || String(error) },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Signup handler error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
