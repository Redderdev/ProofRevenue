// RateLimiterMemory is in-process only — not reliable across distributed serverless instances.
// For login, the durable layer is DB-based account lockout in login/route.ts.
// For signup and metrics, in-memory is accepted as best-effort:
//   - Signup: each account requires real email confirmation, limiting abuse impact.
//   - Metrics: requires a valid authenticated session, so abuse surface is minimal.
import { RateLimiterMemory } from 'rate-limiter-flexible';

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

const signupLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
});

const metricsLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

const normalizeIp = (ip: string | null): string => {
  return ip?.split(',')[0]?.trim() || 'unknown';
};

export const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  return normalizeIp(forwardedFor || realIp || null);
};

export const consumeLoginAttempt = async (request: Request): Promise<{ allowed: boolean; retryAfter?: number }> => {
  const ip = getClientIp(request);

  try {
    await loginLimiter.consume(ip, 1);
    return { allowed: true };
  } catch (rateLimiterRes: any) {
    return { allowed: false, retryAfter: Math.ceil(rateLimiterRes?.msBeforeNext / 1000) || 60 };
  }
};

export const consumeSignupAttempt = async (request: Request): Promise<{ allowed: boolean; retryAfter?: number }> => {
  const ip = getClientIp(request);

  try {
    await signupLimiter.consume(ip, 1);
    return { allowed: true };
  } catch (rateLimiterRes: any) {
    return { allowed: false, retryAfter: Math.ceil(rateLimiterRes?.msBeforeNext / 1000) || 900 };
  }
};

export const consumeMetricsRequest = async (userId: string): Promise<{ allowed: boolean; retryAfter?: number }> => {
  try {
    await metricsLimiter.consume(userId, 1);
    return { allowed: true };
  } catch (rateLimiterRes: any) {
    return { allowed: false, retryAfter: Math.ceil(rateLimiterRes?.msBeforeNext / 1000) || 60 };
  }
};
