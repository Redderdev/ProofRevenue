import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getStripeServerClient } from '@/lib/stripe';
import pool from '@/lib/db';
import crypto from 'crypto';

function generateCertificateId(): string {
  return 'crt_' + crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
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
      // Must have an active Stripe connection
      const connectionResult = await client.query(
        `SELECT id FROM stripe_connections WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );

      if (connectionResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No Stripe account connected' },
          { status: 400 }
        );
      }

      // Prevent double payment — one non-cancelled certificate per user
      const existingCert = await client.query(
        `SELECT id, status FROM certificates WHERE user_id = $1 AND status != 'cancelled' LIMIT 1`,
        [userId]
      );

      if (existingCert.rows.length > 0) {
        return NextResponse.json(
          { error: 'Certificate already exists for this account' },
          { status: 400 }
        );
      }

      // Create the draft certificate row before redirecting to Stripe
      const certificateId = generateCertificateId();
      await client.query(
        `INSERT INTO certificates (id, user_id, status, data_status, is_active, is_public)
         VALUES ($1, $2, 'draft', 'pending', false, true)`,
        [certificateId, userId]
      );

      const stripe = getStripeServerClient();
      const origin =
        request.headers.get('origin') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        '';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'ProofRevenue — Live Certificate',
                description:
                  'Verified revenue certificate refreshed monthly. MRR, ARR, and active customers. Cancel anytime.',
              },
              unit_amount: 900,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        metadata: { certificateId, userId },
        subscription_data: {
          metadata: { certificateId, userId },
        },
        success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Certificate Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
