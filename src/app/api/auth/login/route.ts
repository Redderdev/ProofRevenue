// POST /api/auth/login - User login with Supabase Auth
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { signInUser } from '@/lib/supabase-auth';
import { consumeLoginAttempt } from '@/lib/rate-limit';
import pool from '@/lib/db';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface LoginRequest {
  email?: string;
  password?: string;
}

/**
 * POST /api/auth/login
 * Security:
 * - IP burst filter via RateLimiterMemory (best-effort, same-instance only)
 * - DB-level account lockout via failed_login_attempts + locked_until (durable across all serverless instances)
 * - Generic error messages (no user enumeration)
 * - Session token managed by Supabase Auth in httpOnly cookies
 */
export async function POST(request: NextRequest) {
  // IP-based burst filter — best-effort within a single serverless instance
  const rateLimit = await consumeLoginAttempt(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter ?? 60) } }
    );
  }

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

  // Parse and validate input
  const body: LoginRequest = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // DB-level lockout check — fail-safe: if DB is unavailable, proceed without blocking login
  type UserRow = { id: string; failed_login_attempts: number; locked_until: string | null };
  let userRow: UserRow | null = null;
  try {
    const result = await pool.query<UserRow>(
      `SELECT id, failed_login_attempts, locked_until FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    userRow = result.rows[0] ?? null;

    if (userRow?.locked_until && new Date(userRow.locked_until) > new Date()) {
      const retryAfter = Math.ceil((new Date(userRow.locked_until).getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
  } catch (dbErr) {
    console.error('[login] lockout check failed (proceeding):', dbErr);
    // Non-fatal: don't block login if DB is unavailable
  }

  // Attempt Supabase auth
  try {
    const { user } = await signInUser(normalizedEmail, password, supabase);

    // Reset lockout counters (fire-and-forget — signInUser also resets via Supabase client)
    if (userRow) {
      pool
        .query(
          `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE id = $1`,
          [userRow.id]
        )
        .catch((e) => console.error('[login] counter reset error:', e));
    }

    console.log(`User logged in: ${user.id} (${user.email})`);
    return NextResponse.json(
      { success: true, message: 'Logged in successfully', user: { id: user.id, email: user.email } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error?.message ?? error);

    if (error.message?.includes('Email not confirmed')) {
      return NextResponse.json(
        { error: 'Email not confirmed. Please check your inbox and click the confirmation link.' },
        { status: 403 }
      );
    }

    // Increment failed attempt counter (fire-and-forget)
    if (userRow) {
      const newCount = (userRow.failed_login_attempts ?? 0) + 1;
      const lockUntil =
        newCount >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;
      pool
        .query(
          `UPDATE users SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW() WHERE id = $3`,
          [newCount, lockUntil, userRow.id]
        )
        .catch((e) => console.error('[login] counter increment error:', e));
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}
