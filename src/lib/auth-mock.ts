// Mock authentication service for frontend testing (when database unavailable)
// ⚠️ FOR DEVELOPMENT/TESTING ONLY - NOT FOR PRODUCTION

import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
}

interface MockAuthToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage (cleared when server restarts)
const mockUsers = new Map<string, MockUser>();
const mockTokens = new Map<string, MockAuthToken>();

// Test user for demo purposes
const demoUser: MockUser = {
  id: 'demo-user-123',
  email: 'demo@proofrevenue.com',
  passwordHash: '$2b$12$fake.hashed.password.demo.only', // bcrypt of "Demo123!@"
  isActive: true,
  createdAt: new Date(),
};

export async function initializeMockDb() {
  // Add demo user
  mockUsers.set(demoUser.email, demoUser);
  console.log('✓ Mock authentication service initialized for testing');
}

export async function mockValidatePasswordStrength(password: string) {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function mockCreateUser(email: string, password: string) {
  // Check if email exists
  if (mockUsers.has(email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  // Validate password
  const strength = await mockValidatePasswordStrength(password);
  if (!strength.valid) {
    throw new Error('Password does not meet requirements');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user: MockUser = {
    id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
    isActive: true,
    createdAt: new Date(),
  };

  mockUsers.set(user.email, user);

  return {
    userId: user.id,
    email: user.email,
    isActive: user.isActive,
  };
}

export async function mockAuthenticateUser(email: string, password: string) {
  const user = mockUsers.get(email.toLowerCase());

  if (!user) {
    // Still hash to prevent timing attacks
    await bcrypt.compare(password, '$2b$12$invalid');
    return null;
  }

  // Timing-safe comparison
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    isActive: user.isActive,
  };
}

export async function mockCreateAccessToken(
  userId: string,
  email: string,
  jti: string
) {
  // Simple JWT-like token for mock (not actually signed)
  return Buffer.from(
    JSON.stringify({
      type: 'access',
      userId,
      email,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    })
  ).toString('base64');
}

export async function mockCreateRefreshToken(
  userId: string,
  email: string,
  jti: string
) {
  // Simple JWT-like token for mock (not actually signed)
  return Buffer.from(
    JSON.stringify({
      type: 'refresh',
      userId,
      email,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64');
}

export async function mockVerifyToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      return null; // Token expired
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function mockGetUserById(userId: string) {
  for (const user of mockUsers.values()) {
    if (user.id === userId) {
      return {
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
      };
    }
  }
  return null;
}

export async function mockClearAllUsers() {
  mockUsers.clear();
  mockTokens.clear();
}
