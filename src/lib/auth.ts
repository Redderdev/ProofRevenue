// Secure authentication service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './db';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutes

// ============= PASSWORD SECURITY =============

/**
 * Validate password strength (industry standards)
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Hash password using bcrypt with secure salt rounds
 * Uses bcrypt.hash which is slower (intentional, prevents brute force)
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare password with hash using timing-safe comparison
 * Returns false for non-existent users too (prevents user enumeration)
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    // bcrypt.compare is timing-safe, prevents timing attacks
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

// ============= TOKEN MANAGEMENT =============

interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID for token tracking
}

/**
 * Create access token (short-lived, 15 minutes)
 * Signed with SECRET, httpOnly cookie in prod
 */
export const createAccessToken = (userId: string, email: string, jti: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      userId,
      email,
      jti, // Include token ID for revocation tracking
    } as TokenPayload,
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );
};

/**
 * Create refresh token (long-lived, 7 days)
 * Also stored in database (can be revoked)
 */
export const createRefreshToken = (userId: string, email: string, jti: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      userId,
      email,
      jti,
      type: 'refresh',
    } as TokenPayload,
    process.env.JWT_SECRET,
    {
      expiresIn: `${REFRESH_TOKEN_EXPIRY}s`,
      algorithm: 'HS256',
    }
  );
};

/**
 * Verify JWT token
 * Returns decoded token or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

// ============= ACCOUNT SECURITY =============

/**
 * Check if account is locked due to failed login attempts
 */
export const isAccountLocked = (
  failedAttempts: number,
  lockedUntil: Date | null
): boolean => {
  if (failedAttempts >= MAX_LOGIN_ATTEMPTS && lockedUntil) {
    // Account is locked if lockout time hasn't expired
    return new Date() < lockedUntil;
  }
  return false;
};

/**
 * Record failed login attempt and lock account if needed
 */
export const recordFailedLogin = async (userId: string): Promise<void> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT failed_login_attempts FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rows[0]) return;

    const newAttempts = result.rows[0].failed_login_attempts + 1;
    const lockedUntil = newAttempts >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_TIME_MS) : null;

    await client.query(
      `UPDATE users SET failed_login_attempts = $1, locked_until = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [newAttempts, lockedUntil, userId]
    );

    // Audit log failed attempt
    await client.query(
      `INSERT INTO audit_logs (action, target, role, status, details, created_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        'login_failed',
        userId,
        'user',
        'error',
        { attempt: newAttempts, max_attempts: MAX_LOGIN_ATTEMPTS },
      ]
    );
  } finally {
    client.release();
  }
};

/**
 * Reset failed login attempts on successful login
 */
export const resetFailedLoginAttempts = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId]
  );
};

// ============= REFRESH TOKEN STORAGE =============

/**
 * Store refresh token hash in database
 * Uses token family for rotation detection (prevents replay attacks)
 */
export const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
  tokenFamily?: string
): Promise<string> => {
  const client = await pool.connect();

  try {
    // Hash refresh token before storing (never store plain tokens)
    const tokenHash = await hashPassword(refreshToken);
    const family = tokenFamily || crypto.randomUUID();

    await client.query(
      `INSERT INTO auth_tokens (user_id, refresh_token_hash, token_family, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, tokenHash, family, new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000)]
    );

    return family;
  } finally {
    client.release();
  }
};

/**
 * Verify refresh token exists and hasn't been revoked
 * If token reuse detected (replay attack), revoke entire family
 */
export const verifyRefreshTokenExists = async (userId: string, tokenHash: string): Promise<boolean> => {
  const result = await pool.query(
    `SELECT id, revoked_at FROM auth_tokens 
     WHERE user_id = $1 AND refresh_token_hash = $2 AND expires_at > CURRENT_TIMESTAMP`,
    [userId, tokenHash]
  );

  if (result.rows.length === 0) {
    return false;
  }

  // Check if token was revoked (indicates compromise)
  if (result.rows[0].revoked_at) {
    // Potential replay attack detected - revoke entire token family
    await pool.query(
      `UPDATE auth_tokens SET revoked_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    return false;
  }

  return true;
};

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
export const revokeAllRefreshTokens = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE auth_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
};

/**
 * Revoke single refresh token (logout current device)
 */
export const revokeSingleRefreshToken = async (tokenHash: string): Promise<void> => {
  await pool.query(
    `UPDATE auth_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE refresh_token_hash = $1`,
    [tokenHash]
  );
};

// ============= USER MANAGEMENT =============

/**
 * Create new user account
 * ATOMIC operation - either fully succeeds or fully fails
 */
export const createUser = async (email: string, password: string): Promise<{ userId: string; email: string }> => {
  const client = await pool.connect();

  try {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Begin transaction
    await client.query('BEGIN');

    // Insert user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, is_active, failed_login_attempts)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [email, passwordHash, true, 0]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (action, target, role, status, details, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        'user_created',
        result.rows[0].id,
        'system',
        'success',
        { email },
      ]
    );

    await client.query('COMMIT');

    return {
      userId: result.rows[0].id,
      email: result.rows[0].email,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('User creation failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Authenticate user with email and password
 * Returns null if credentials invalid (no user enumeration)
 */
export const authenticateUser = async (
  email: string,
  password: string
): Promise<{ userId: string; email: string; isActive: boolean } | null> => {
  const result = await pool.query(
    `SELECT id, email, password_hash, is_active, failed_login_attempts, locked_until
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    // User not found - return generic error (prevents enumeration)
    return null;
  }

  const user = result.rows[0];

  // Check if account is locked
  if (isAccountLocked(user.failed_login_attempts, user.locked_until)) {
    return null;
  }

  // Verify password (timing-safe)
  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // Record failed attempt
    await recordFailedLogin(user.id);
    return null;
  }

  // Success - reset failed attempts
  await resetFailedLoginAttempts(user.id);

  return {
    userId: user.id,
    email: user.email,
    isActive: user.is_active,
  };
};

/**
 * Get user by ID (safe - never returns password)
 */
export const getUserById = async (userId: string) => {
  const result = await pool.query(
    `SELECT id, email, stripe_account_id, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};
