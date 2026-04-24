import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import pool from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getIpAddress } from '@/lib/utils';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify Stripe webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);

    const client = await pool.connect();

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const certificateId = session.metadata?.certificateId;

          if (!certificateId) {
            console.error('Missing certificateId in session metadata');
            break;
          }

          // Update certificate status to processing
          await client.query(
            `UPDATE certificates SET status = 'processing', data_status = 'pending'
             WHERE id = $1`,
            [certificateId]
          );

          // Log audit entry
          await client.query(
            `INSERT INTO audit_logs (actor, action, target, ip_address, role, status, details)
             VALUES ('system', 'webhook_checkout_complete', $1, $2, NULL, 'success', $3)`,
            [session.id, 'stripe', JSON.stringify({ sessionId: session.id })]
          );

          break;
        }

        case 'account.updated': {
          const account = event.data.object as any;
          const stripeAccountId = account.id;

          // Update user info if account details changed
          await client.query(
            `UPDATE users SET country = $1, livemode = $2, updated_at = NOW()
             WHERE stripe_account_id = $3`,
            [account.country, account.charges_enabled, stripeAccountId]
          );

          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Store event in database
      await client.query(
        `INSERT INTO stripe_events (id, type, data, processed)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (id) DO NOTHING`,
        [event.id, event.type, JSON.stringify(event.data)]
      );

      return NextResponse.json({ received: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
