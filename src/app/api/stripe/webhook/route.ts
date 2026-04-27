import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getStripeServerClient } from '@/lib/stripe';
// import { getIpAddress } from '@/lib/utils';
// import { fetchAndCacheMetrics } from '@/lib/stripe-api';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeServerClient();
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
        // Subscription events (update revenue metrics)
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          console.log(`[Webhook] ${event.type}`);
          
          // Invalidate metrics cache to force refresh on next request
          const stripeUserId = (event.data.object as any)?.livemode ? 
            (event.data.object as any)?.id : null;

          if (stripeUserId) {
            // Find user by stripe connection and invalidate metrics
            const userResult = await client.query(
              `UPDATE stripe_connections 
               SET last_metrics_fetch = NULL
               WHERE stripe_user_id = $1
               RETURNING user_id`,
              [stripeUserId]
            );

            if (userResult.rows.length > 0) {
              const userId = userResult.rows[0].user_id;
              console.log(`[Webhook] Invalidated metrics cache for user: ${userId}`);
            }
          }

          break;
        }

        // Invoice paid (revenue confirmation)
        case 'invoice.paid': {
          const invoice = event.data.object as any;
          console.log(`[Webhook] invoice.paid - amount: ${invoice.amount_paid}`);

          // This will be picked up by metric refresh
          // but could trigger immediate metrics update in future
          break;
        }

        // Account deauthorization (user revoked access)
        case 'account.application.deauthorized': {
          const account = event.data.object as any;
          console.log(`[Webhook] account.application.deauthorized: ${account.id}`);

          // Revoke the connection
          await client.query(
            `UPDATE stripe_connections 
             SET revoked_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE stripe_user_id = $1`,
            [account.id]
          );

          // Update user
          await client.query(
            `UPDATE users 
             SET connected_at = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE stripe_account_id = $1`,
            [account.id]
          );

          console.log(`[Webhook] Connection revoked for Stripe user: ${account.id}`);
          break;
        }

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
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      // Store event in database for audit trail
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
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
