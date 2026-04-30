import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getStripeServerClient } from '@/lib/stripe';
import { fetchAndCacheMetrics } from '@/lib/stripe-api';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
}

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
    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET!);

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
          const userId = session.metadata?.userId;

          if (!certificateId || !userId) {
            console.error('[Webhook] Missing certificateId or userId in session metadata');
            break;
          }

          // Verify the certificate belongs to the claimed userId — never trust metadata alone
          const ownerCheck = await client.query(
            `SELECT user_id FROM certificates WHERE id = $1`,
            [certificateId]
          );
          if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== userId) {
            console.error(`[Webhook] Ownership mismatch for certificate ${certificateId} / user ${userId}`);
            break;
          }

          const now = new Date();
          const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          try {
            // Fetch live metrics from the user's connected Stripe account
            const metrics = await fetchAndCacheMetrics(userId);

            // Pull last 12 months of MRR history for the sparkline
            const historyResult = await client.query(
              `SELECT mrr FROM revenue_snapshots
               WHERE user_id = $1
               ORDER BY snapshot_date ASC
               LIMIT 12`,
              [userId]
            );
            const mrrHistory = historyResult.rows.map((r: any) => r.mrr);
            // Always include today's value at the end
            if (metrics) mrrHistory.push(metrics.mrr);

            if (metrics) {
              await client.query(
                `UPDATE certificates
                 SET status = 'active',
                     data_status = 'verified',
                     is_active = true,
                     mrr = $1,
                     arr = $2,
                     customers = $3,
                     total_revenue = $4,
                     mrr_history = $5,
                     issued_at = $6,
                     verified_at = $6,
                     last_snapshot_at = $6,
                     next_refresh_at = $7,
                     updated_at = $6
                 WHERE id = $8`,
                [
                  metrics.mrr,
                  metrics.arr,
                  metrics.activeCustomers,
                  metrics.totalRevenue,
                  JSON.stringify(mrrHistory),
                  now,
                  nextRefresh,
                  certificateId,
                ]
              );
              console.log(`[Webhook] Certificate ${certificateId} issued with real metrics`);
            } else {
              // Metrics unavailable — activate the cert, mark data as pending for retry
              await client.query(
                `UPDATE certificates
                 SET status = 'active',
                     data_status = 'pending',
                     is_active = true,
                     issued_at = $1,
                     updated_at = $1
                 WHERE id = $2`,
                [now, certificateId]
              );
              console.warn(`[Webhook] Certificate ${certificateId} issued but metrics unavailable`);
            }
          } catch (err) {
            console.error('[Webhook] Failed to snapshot metrics:', err);
            // Still activate the cert so the user isn't blocked
            await client.query(
              `UPDATE certificates
               SET status = 'active', is_active = true, issued_at = $1, updated_at = $1
               WHERE id = $2`,
              [now, certificateId]
            );
          }

          await client.query(
            `INSERT INTO audit_logs (actor, action, target, ip_address, role, status, details)
             VALUES ('system', 'certificate_issued', $1, 'stripe', NULL, 'success', $2)`,
            [certificateId, JSON.stringify({ sessionId: session.id, userId })]
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
