import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { stripe, exchangeOAuthCode } from '@/lib/stripe';
import { generateCertificateId } from '@/lib/utils';

// POST /api/stripe/oauth-callback
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json() as { code?: string; state?: string };

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // Exchange code for Stripe account ID
    const stripeAccountId = await exchangeOAuthCode(code);

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'Failed to retrieve Stripe account ID' },
        { status: 400 }
      );
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Upsert user in database
    const client = await pool.connect();
    try {
      const email = account.email || `user_${stripeAccountId}@proofrevenue.internal`;
      const country = account.country || null;
      const livemode = account.charges_enabled === true;

      const result = await client.query(
        `INSERT INTO users (email, stripe_account_id, country, livemode, connected_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (stripe_account_id) DO UPDATE SET
           email = $1,
           country = $3,
           livemode = $4,
           connected_at = NOW()
         RETURNING id`,
        [email, stripeAccountId, country, livemode]
      );

      const userId = result.rows[0]?.id;

      if (!userId) {
        throw new Error('Failed to create/update user');
      }

      // Create initial certificate
      const certificateId = generateCertificateId();
      await client.query(
        `INSERT INTO certificates (id, user_id, status, data_status)
         VALUES ($1, $2, 'draft', 'pending')`,
        [certificateId, userId]
      );

      return NextResponse.json({
        success: true,
        userId,
        certificateId,
        stripeAccountId,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
