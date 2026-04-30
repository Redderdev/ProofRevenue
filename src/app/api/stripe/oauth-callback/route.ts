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

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { validateOAuthState, exchangeOAuthCode, encryptToken, logOAuthEvent } from '@/lib/stripe-oauth';
import Stripe from 'stripe';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') as string | null;
  const errorDescription = searchParams.get('error_description');

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

  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data.user) {
    console.warn('[OAuth Callback] Missing Supabase session');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?next=%2Fdashboard%3Fstate%3Dstripe_error`,
      { status: 302 }
    );
  }

  const userId = data.user.id;

  const markStripeFailed = async () => {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE users
         SET stripe_connect_failed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );
    } finally {
      client.release();
    }
  };

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

    await markStripeFailed();

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

    await markStripeFailed();

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

    await markStripeFailed();

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

      await markStripeFailed();

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

    const stripeClient = new Stripe(tokenResponse.access_token, {
      apiVersion: '2023-10-16',
    });
    const account = await stripeClient.accounts.retrieve();
    const accountName = account.business_profile?.name || account.settings?.dashboard?.display_name || null;
    const accountUrl = account.business_profile?.url || null;
    const accountCountry = account.country || null;

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
             account_name = $8,
             account_url = $9,
             account_country = $10,
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
          accountName,
          accountUrl,
          accountCountry,
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
          account_name,
          account_url,
          account_country,
          connected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
        [
          userId,
          tokenResponse.stripe_user_id,
          Buffer.from(accessTokenEncrypted, 'utf8'),
          accessTokenIv,
          refreshTokenData ? Buffer.from(refreshTokenData.encryptedData, 'utf8') : null,
          refreshTokenData ? refreshTokenData.iv : null,
          tokenResponse.livemode,
          tokenResponse.scope,
          accountName,
          accountUrl,
          accountCountry,
        ]
      );
    }

    // Update user's stripe connection info
    await client.query(
      `UPDATE users 
       SET stripe_account_id = $2,
           livemode = $3,
           connected_at = CURRENT_TIMESTAMP,
           stripe_connect_failed_at = NULL,
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

    await markStripeFailed();

    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('state', 'stripe_error');
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } finally {
    client.release();
  }
}
