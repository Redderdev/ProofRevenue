import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getStripeServerClient } from '@/lib/stripe';
import pool from '@/lib/db';

// POST /api/stripe/disconnect
export async function POST() {
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

    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = data.user.id;
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT stripe_user_id FROM stripe_connections
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'No active Stripe connection' }, { status: 404 });
      }

      const stripeUserId = result.rows[0].stripe_user_id;

      // Deauthorize on Stripe's side so the connected account loses access
      try {
        const stripe = getStripeServerClient();
        await (stripe as any).oauth.deauthorize({
          client_id: process.env.STRIPE_OAUTH_CLIENT_ID,
          stripe_user_id: stripeUserId,
        });
      } catch (stripeErr: any) {
        // If Stripe says it's already deauthorized, continue — still revoke locally
        if (!stripeErr?.message?.includes('No such application')) {
          console.error('[Disconnect] Stripe deauthorize error:', stripeErr?.message);
        }
      }

      await client.query('BEGIN');

      await client.query(
        `UPDATE stripe_connections
         SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );

      await client.query(
        `UPDATE users
         SET stripe_account_id = NULL, connected_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );

      await client.query('COMMIT');

      console.log(`[Disconnect] Stripe disconnected for user: ${userId}`);
      return NextResponse.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Disconnect] Error:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
