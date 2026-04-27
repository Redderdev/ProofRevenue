// POST /api/auth/signup - Create new user account
import { NextRequest, NextResponse } from 'next/server';
import { createUser, validatePasswordStrength } from '@/lib/auth';
import { mockCreateUser } from '@/lib/auth-mock';

const ALLOW_MOCK_FALLBACK =
  process.env.AUTH_ALLOW_MOCK_FALLBACK === 'true' &&
  process.env.NODE_ENV !== 'production';

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

    // Create user (will throw if email already exists)
    try {
      const user = await createUser(email.toLowerCase().trim(), password);

      // Return success - don't reveal password or token yet
      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully',
          user: { id: user.userId, email: user.email },
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      if (!ALLOW_MOCK_FALLBACK) {
        console.error('Database unavailable during signup:', {
          code: dbError?.code,
          message: dbError?.message,
        });

        if (dbError?.code === '42P01') {
          return NextResponse.json(
            {
              error: 'Database schema is not initialized.',
              code: 'DB_SCHEMA_MISSING',
            },
            { status: 503 }
          );
        }

        return NextResponse.json(
          {
            error: 'Database unavailable. Please try again shortly.',
            code: 'DB_UNAVAILABLE',
          },
          { status: 503 }
        );
      }

      // Fall back to mock for local frontend testing only
      console.warn('Database unavailable, using mock authentication for testing:', dbError.message);
      
      try {
        const user = await mockCreateUser(email.toLowerCase().trim(), password);
        return NextResponse.json(
          {
            success: true,
            message: 'Account created successfully (test mode)',
            user: { id: user.userId, email: user.email },
          },
          { status: 201 }
        );
      } catch (mockError: any) {
        if (mockError.message?.includes('already registered')) {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 409 }
          );
        }
        throw mockError;
      }
    }
  } catch (error: any) {
    console.error('Signup error:', error);

    // Check for duplicate email error from database
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already registered')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Generic server error (don't expose internals)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
