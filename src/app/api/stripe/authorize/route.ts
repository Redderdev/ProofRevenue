/**
 * Stripe OAuth Authorization Endpoint
 * 
 * GET /api/stripe/authorize
 * 
 * Generates a cryptographically secure state parameter and redirects to Stripe's OAuth flow.
 * The state parameter is used for CSRF protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthState, getStripeOAuthUrl, logOAuthEvent } from '@/lib/stripe-oauth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret');

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and extract user ID
    let userId: string;
    try {
      const verified = await jwtVerify(accessToken, JWT_SECRET);
      userId = verified.payload.userId as string;

      if (!userId) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.warn('[OAuth] Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Generate secure state for CSRF protection
    const state = generateOAuthState(userId);

    // Get OAuth URL
    const oauthUrl = getStripeOAuthUrl(state);

    // Log authorization attempt
    await logOAuthEvent('authorize_start', userId, { success: true });

    // Redirect to Stripe OAuth
    return NextResponse.redirect(oauthUrl, { status: 302 });
  } catch (error) {
    console.error('[OAuth] Authorization error:', error);

    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    );
  }
}
