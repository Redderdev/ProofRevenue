/**
 * Stripe OAuth Callback Handler
 *
 * GET /api/stripe/oauth-callback?code=...&state=...
 *
 * Security model: connect-fetch-disconnect.
 * 1. Validate CSRF state
 * 2. Exchange code for token (in memory only)
 * 3. Fetch account info + revenue metrics using token
 * 4. Immediately deauthorize on Stripe — token is now dead everywhere
 * 5. Store ONLY: account info + metrics snapshot. No token ever written to DB.
 * 6. If user has an active certificate awaiting refresh, update it now.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { validateOAuthState, exchangeOAuthCode, logOAuthEvent } from '@/lib/stripe-oauth';
import { fetchMetricsWithToken, storeConnectionMetrics } from '@/lib/stripe-api';
import { getStripeServerClient } from '@/lib/stripe';
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
        `UPDATE users SET stripe_connect_failed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [userId]
      );
    } finally {
      client.release();
    }
  };

  const redirectDashboard = (state: string) => {
    const url = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL);
    url.searchParams.set('state', state);
    return NextResponse.redirect(url, { status: 302 });
  };

  if (error) {
    console.warn('[OAuth Callback] User denied:', { error, error_description: errorDescription, userId });
    await logOAuthEvent('authorize_denied', userId, { error, error_description: errorDescription, success: false });
    await markStripeFailed();
    return redirectDashboard('stripe_denied');
  }

  if (!code || !state) {
    console.error('[OAuth Callback] Missing code or state');
    await markStripeFailed();
    return redirectDashboard('stripe_error');
  }

  if (!validateOAuthState(state, userId)) {
    console.error('[OAuth Callback] Invalid state parameter (CSRF check failed)');
    await markStripeFailed();
    return redirectDashboard('stripe_error');
  }

  const client = await pool.connect();

  try {
    // 1. Exchange code → access token (stays in memory, never written to DB)
    let tokenResponse;
    try {
      tokenResponse = await exchangeOAuthCode(code);
    } catch (err) {
      console.error('[OAuth Callback] Token exchange failed:', err);
      await markStripeFailed();
      return redirectDashboard('stripe_error');
    }

    const { access_token, stripe_user_id, livemode, scope } = tokenResponse;

    // 2. Fetch account info using the in-memory token
    const connectedStripe = new Stripe(access_token, { apiVersion: '2023-10-16' });
    let accountName: string | null = null;
    let accountUrl: string | null = null;
    let accountCountry: string | null = null;
    try {
      const account = await connectedStripe.accounts.retrieve();
      accountName = account.business_profile?.name || account.settings?.dashboard?.display_name || null;
      accountUrl = account.business_profile?.url || null;
      accountCountry = account.country || null;
    } catch (err) {
      console.warn('[OAuth Callback] Failed to fetch account info:', err);
    }

    // 3. Fetch revenue metrics using the in-memory token
    const metrics = await fetchMetricsWithToken(access_token);

    // 4. Deauthorize on Stripe immediately — token is now dead everywhere
    try {
      const platformStripe = getStripeServerClient();
      await (platformStripe as any).oauth.deauthorize({
        client_id: process.env.STRIPE_OAUTH_CLIENT_ID,
        stripe_user_id,
      });
      console.log(`[OAuth Callback] Deauthorized stripe_user_id=${stripe_user_id} — token discarded`);
    } catch (err: any) {
      // Already deauthorized is fine — just log and continue
      if (!err?.message?.includes('No such application')) {
        console.warn('[OAuth Callback] Deauthorize warning:', err?.message);
      }
    }

    // 5. Save connection WITHOUT any token fields
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM stripe_connections WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE stripe_connections
         SET access_token_encrypted = NULL,
             access_token_iv = NULL,
             refresh_token_encrypted = NULL,
             refresh_token_iv = NULL,
             livemode = $2,
             scope = $3,
             account_name = $4,
             account_url = $5,
             account_country = $6,
             connected_at = CURRENT_TIMESTAMP,
             revoked_at = NULL,
             last_metrics_fetch = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId, livemode, scope, accountName, accountUrl, accountCountry]
      );
    } else {
      await client.query(
        `INSERT INTO stripe_connections
           (user_id, stripe_user_id, livemode, scope, account_name, account_url, account_country, connected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [userId, stripe_user_id, livemode, scope, accountName, accountUrl, accountCountry]
      );
    }

    await client.query(
      `UPDATE users
       SET stripe_account_id = $2, livemode = $3, connected_at = CURRENT_TIMESTAMP,
           stripe_connect_failed_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId, stripe_user_id, livemode]
    );

    // 6. If an active certificate is awaiting refresh, update it with new metrics
    if (metrics) {
      const refreshResult = await client.query(
        `UPDATE certificates
         SET mrr = $2, arr = $3, customers = $4,
             data_status = 'verified',
             verified_at = NOW(),
             last_snapshot_at = NOW(),
             next_refresh_at = NOW() + INTERVAL '30 days',
             updated_at = NOW()
         WHERE user_id = $1 AND status = 'active' AND data_status = 'refresh_needed'
         RETURNING id`,
        [userId, metrics.mrr, metrics.arr, metrics.activeCustomers]
      );
      if (refreshResult.rows.length > 0) {
        console.log(`[OAuth Callback] Certificate ${refreshResult.rows[0].id} refreshed with new metrics`);
      }
    }

    await client.query('COMMIT');

    // 7. Store metrics snapshot in stripe_connections + revenue_snapshots
    if (metrics) {
      await storeConnectionMetrics(userId, metrics);
    } else {
      console.warn(`[OAuth Callback] Metrics unavailable for user ${userId} — cert data may be pending`);
    }

    await logOAuthEvent('authorize_success', userId, { stripe_user_id, livemode, token_stored: false });

    // Redirect to the callback page (shows "Connected!" then goes to dashboard)
    const redirectUrl = new URL('/connect/stripe/callback', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('livemode', livemode ? 'true' : 'false');
    return NextResponse.redirect(redirectUrl, { status: 302 });

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[OAuth Callback] Unexpected error:', err);
    await markStripeFailed();
    return redirectDashboard('stripe_error');
  } finally {
    client.release();
  }
}
