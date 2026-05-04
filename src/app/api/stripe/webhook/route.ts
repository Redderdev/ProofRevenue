import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getStripeServerClient } from '@/lib/stripe';
import { fetchAndCacheMetrics } from '@/lib/stripe-api';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
}

async function snapshotCertificate(
  client: any,
  certificateId: string,
  userId: string
): Promise<void> {
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const metrics = await fetchAndCacheMetrics(userId);

  const historyResult = await client.query(
    `SELECT mrr FROM revenue_snapshots
     WHERE user_id = $1 ORDER BY snapshot_date ASC LIMIT 12`,
    [userId]
  );
  const mrrHistory = historyResult.rows.map((r: any) => r.mrr);
  if (metrics) mrrHistory.push(metrics.mrr);

  if (metrics) {
    await client.query(
      `UPDATE certificates
       SET status = 'active',
           data_status = 'verified',
           is_active = true,
           mrr = $1, arr = $2, customers = $3, total_revenue = $4,
           mrr_history = $5,
           issued_at = COALESCE(issued_at, $6),
           verified_at = $6,
           last_snapshot_at = $6,
           next_refresh_at = $7,
           updated_at = $6
       WHERE id = $8`,
      [
        metrics.mrr, metrics.arr, metrics.activeCustomers, metrics.totalRevenue,
        JSON.stringify(mrrHistory),
        now, nextRefresh, certificateId,
      ]
    );
    console.log(`[Webhook] Snapshotted metrics for certificate ${certificateId}`);
  } else {
    await client.query(
      `UPDATE certificates
       SET status = 'active', data_status = 'pending', is_active = true,
           issued_at = COALESCE(issued_at, $1), updated_at = $1
       WHERE id = $2`,
      [now, certificateId]
    );
    console.warn(`[Webhook] Certificate ${certificateId} activated but metrics unavailable`);
  }
}

// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeServerClient();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET!);
    const client = await pool.connect();

    try {
      switch (event.type) {

        // ── Checkout completed → activate certificate ──────────────────────
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const certificateId = session.metadata?.certificateId;
          const userId = session.metadata?.userId;

          if (!certificateId || !userId) {
            console.error('[Webhook] Missing certificateId or userId in session metadata');
            break;
          }

          // Ownership check — never trust metadata alone
          const ownerCheck = await client.query(
            `SELECT user_id FROM certificates WHERE id = $1`,
            [certificateId]
          );
          if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== userId) {
            console.error(`[Webhook] Ownership mismatch for certificate ${certificateId}`);
            break;
          }

          // Store Stripe customer + subscription IDs for lifecycle management
          const customerId = session.customer as string | null;
          const subscriptionId = session.subscription as string | null;
          if (customerId || subscriptionId) {
            await client.query(
              `UPDATE certificates
               SET stripe_customer_id = COALESCE($1, stripe_customer_id),
                   stripe_subscription_id = COALESCE($2, stripe_subscription_id)
               WHERE id = $3`,
              [customerId, subscriptionId, certificateId]
            );
          }

          try {
            await snapshotCertificate(client, certificateId, userId);
          } catch (err) {
            console.error('[Webhook] Failed to snapshot metrics:', err);
            // Still activate so user isn't blocked
            const now = new Date();
            await client.query(
              `UPDATE certificates
               SET status = 'active', is_active = true,
                   issued_at = COALESCE(issued_at, $1), updated_at = $1
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

        // ── Monthly renewal → refresh certificate data ─────────────────────
        case 'invoice.paid': {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription as string | null;

          if (!subscriptionId) break;

          // Only refresh already-active certificates (skip the first invoice,
          // which checkout.session.completed already handled)
          const certResult = await client.query(
            `SELECT id, user_id FROM certificates
             WHERE stripe_subscription_id = $1 AND is_active = true AND status = 'active'`,
            [subscriptionId]
          );

          if (certResult.rows.length === 0) break;

          const { id: certId, user_id: certUserId } = certResult.rows[0];
          console.log(`[Webhook] invoice.paid — refreshing certificate ${certId}`);

          try {
            await snapshotCertificate(client, certId, certUserId);
          } catch (err) {
            console.error('[Webhook] Renewal refresh failed:', err);
          }
          break;
        }

        // ── Subscription cancelled → deactivate certificate ────────────────
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const certId = subscription.metadata?.certificateId;

          if (certId) {
            await client.query(
              `UPDATE certificates
               SET status = 'cancelled', is_active = false, updated_at = NOW()
               WHERE id = $1`,
              [certId]
            );
            console.log(`[Webhook] Certificate ${certId} deactivated — subscription cancelled`);
          }
          break;
        }

        // ── Subscription updated (e.g. past_due) ──────────────────────────
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const certId = subscription.metadata?.certificateId;
          const status = subscription.status;

          if (certId && (status === 'past_due' || status === 'unpaid')) {
            await client.query(
              `UPDATE certificates SET data_status = 'payment_failed', updated_at = NOW()
               WHERE id = $1`,
              [certId]
            );
            console.warn(`[Webhook] Certificate ${certId} payment issue — status: ${status}`);
          }
          break;
        }

        // ── Stripe account deauthorized (user revoked OAuth) ──────────────
        case 'account.application.deauthorized': {
          const account = event.data.object as any;
          console.log(`[Webhook] account.application.deauthorized: ${account.id}`);

          await client.query(
            `UPDATE stripe_connections
             SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE stripe_user_id = $1`,
            [account.id]
          );
          await client.query(
            `UPDATE users
             SET connected_at = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE stripe_account_id = $1`,
            [account.id]
          );
          break;
        }

        case 'account.updated': {
          const account = event.data.object as any;
          await client.query(
            `UPDATE users SET country = $1, livemode = $2, updated_at = NOW()
             WHERE stripe_account_id = $3`,
            [account.country, account.charges_enabled, account.id]
          );
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

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
