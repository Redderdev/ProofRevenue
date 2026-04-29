/**
 * Stripe OAuth Authorization Endpoint
 * 
 * GET /api/stripe/authorize
 * 
 * Generates a cryptographically secure state parameter and redirects to Stripe's OAuth flow.
 * The state parameter is used for CSRF protection.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { generateOAuthState, getStripeOAuthUrl, logOAuthEvent } from '@/lib/stripe-oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = data.user.id;

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
