/**
 * Stripe OAuth Callback Handler
 * 
 * GET /api/stripe/oauth-callback?code=...&state=...
 * 
 * Handles the OAuth callback from Stripe. This endpoint:
 * 1. Validates the state parameter (CSRF protection)
 * 2. Exchanges the authorization code for access tokens
 * 3. Encrypts tokens before storage in database
 * 4. Saves connection info with encrypted tokens
 * 5. Redirects to frontend callback page with session info
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOAuthState, exchangeOAuthCode, encryptToken, logOAuthEvent } from '@/lib/stripe-oauth';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') as string | null;
  const errorDescription = searchParams.get('error_description');

  // Get access token from cookie to identify user
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    console.warn('[OAuth Callback] Missing access token');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?next=%2Fdashboard%3Fstate%3Dstripe_error`,
      { status: 302 }
    );
  }

  let userId: string;
  try {
    const verified = await jwtVerify(accessToken, JWT_SECRET);
    userId = verified.payload.userId as string;

    if (!userId) {
      throw new Error('No user ID in token');
    }
  } catch (error) {
    console.warn('[OAuth Callback] Invalid token:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?next=%2Fdashboard%3Fstate%3Dstripe_error`,
      { status: 302 }
    );
  }

  // Handle user denial
  if (error) {
    console.warn('[OAuth Callback] User denied:', {
      error,
      error_description: errorDescription,
      userId,
    });

    await logOAuthEvent('authorize_denied', userId, {
      error,
      error_description: errorDescription,
      success: false,
    });

    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('state', 'stripe_denied');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('[OAuth Callback] Missing code or state', {
      hasCode: !!code,
      hasState: !!state,
    });

    await logOAuthEvent('authorize_error', userId, {
      reason: 'missing_parameters',
      success: false,
    });

    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('state', 'stripe_error');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // Validate state parameter (CSRF protection)
  if (!validateOAuthState(state, userId)) {
    console.error('[OAuth Callback] Invalid state parameter', {
      userId,
      state: state.substring(0, 8) + '...',
    });

    await logOAuthEvent('authorize_csrf', userId, {
      reason: 'state_validation_failed',
      success: false,
    });

    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('state', 'stripe_error');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  const client = await pool.connect();

  try {
    // Exchange code for tokens
    let tokenResponse;
    try {
      tokenResponse = await exchangeOAuthCode(code);
    } catch (error) {
      console.error('[OAuth Callback] Token exchange failed:', error);

      await logOAuthEvent('token_exchange_error', userId, {
        error: String(error),
        success: false,
      });

      const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
      redirectUrl.searchParams.set('state', 'stripe_error');
      return NextResponse.redirect(redirectUrl, { status: 302 });
    }

    // Encrypt tokens for storage
    const { encryptedData: accessTokenEncrypted, iv: accessTokenIv } = encryptToken(
      tokenResponse.access_token
    );

    const refreshTokenData = tokenResponse.refresh_token
      ? encryptToken(tokenResponse.refresh_token)
      : null;

    // Save to database (or update if already connected)
    await client.query('BEGIN');

    // Check if already connected
    const existingConnection = await client.query(
      'SELECT id FROM stripe_connections WHERE user_id = $1',
      [userId]
    );

    if (existingConnection.rows.length > 0) {
      // Update existing connection
      await client.query(
        `UPDATE stripe_connections 
         SET access_token_encrypted = $2,
             access_token_iv = $3,
             refresh_token_encrypted = $4,
             refresh_token_iv = $5,
             livemode = $6,
             scope = $7,
             connected_at = CURRENT_TIMESTAMP,
             revoked_at = NULL,
             last_metrics_fetch = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [
          userId,
          Buffer.from(accessTokenEncrypted, 'utf8'),
          accessTokenIv,
          refreshTokenData ? Buffer.from(refreshTokenData.encryptedData, 'utf8') : null,
          refreshTokenData ? refreshTokenData.iv : null,
          tokenResponse.livemode,
          tokenResponse.scope,
        ]
      );
    } else {
      // Insert new connection
      await client.query(
        `INSERT INTO stripe_connections (
          user_id,
          stripe_user_id,
          access_token_encrypted,
          access_token_iv,
          refresh_token_encrypted,
          refresh_token_iv,
          livemode,
          scope,
          connected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          userId,
          tokenResponse.stripe_user_id,
          Buffer.from(accessTokenEncrypted, 'utf8'),
          accessTokenIv,
          refreshTokenData ? Buffer.from(refreshTokenData.encryptedData, 'utf8') : null,
          refreshTokenData ? refreshTokenData.iv : null,
          tokenResponse.livemode,
          tokenResponse.scope,
        ]
      );
    }

    // Update user's stripe connection info
    await client.query(
      `UPDATE users 
       SET stripe_account_id = $2,
           livemode = $3,
           connected_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId, tokenResponse.stripe_user_id, tokenResponse.livemode]
    );

    await client.query('COMMIT');

    // Log successful connection
    await logOAuthEvent('authorize_success', userId, {
      stripe_user_id: tokenResponse.stripe_user_id,
      livemode: tokenResponse.livemode,
      success: true,
    });

    // Redirect to callback page which will fetch metrics
    const redirectUrl = new URL('/connect/stripe/callback', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('livemode', tokenResponse.livemode ? 'true' : 'false');

    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[OAuth Callback] Database error:', error);

    await logOAuthEvent('database_error', userId, {
      error: String(error),
      success: false,
    });

    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('state', 'stripe_error');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } finally {
    client.release();
  }
}
