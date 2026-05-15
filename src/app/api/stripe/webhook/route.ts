import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getStripeServerClient } from '@/lib/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
}

/**
 * Snapshot a certificate using already-stored metrics from stripe_connections.
 * No Stripe API call — the token was discarded after the OAuth connect.
 */
async function snapshotCertificateFromStored(
  client: any,
  certificateId: string,
  userId: string
): Promise<void> {
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const metricsResult = await client.query(
    `SELECT mrr, arr, active_customers FROM stripe_connections
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );

  const historyResult = await client.query(
    `SELECT mrr FROM revenue_snapshots
     WHERE user_id = $1 ORDER BY snapshot_date ASC LIMIT 12`,
    [userId]
  );

  if (metricsResult.rows.length > 0 && metricsResult.rows[0].mrr !== null) {
    const m = metricsResult.rows[0];
    const mrrHistory = historyResult.rows.map((r: any) => r.mrr);
    mrrHistory.push(m.mrr);

    await client.query(
      `UPDATE certificates
       SET status = 'active',
           data_status = 'verified',
           is_active = true,
           mrr = $1, arr = $2, customers = $3,
           mrr_history = $4,
           issued_at = COALESCE(issued_at, $5),
           verified_at = $5,
           last_snapshot_at = $5,
           next_refresh_at = $6,
           updated_at = $5
       WHERE id = $7`,
      [m.mrr, m.arr, m.active_customers, JSON.stringify(mrrHistory), now, nextRefresh, certificateId]
    );
    console.log(`[Webhook] Certificate ${certificateId} activated with stored metrics`);
  } else {
    // Metrics not yet stored (edge case: user paid before OAuth fetch completed)
    await client.query(
      `UPDATE certificates
       SET status = 'active', data_status = 'pending', is_active = true,
           issued_at = COALESCE(issued_at, $1), updated_at = $1
       WHERE id = $2`,
      [now, certificateId]
    );
    console.warn(`[Webhook] Certificate ${certificateId} activated but no stored metrics found`);
  }
}

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
      // Atomic idempotency claim
      const claimed = await client.query(
        `INSERT INTO stripe_events (id, type, data, processed)
         VALUES ($1, $2, $3, false)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [event.id, event.type, JSON.stringify(event.data)]
      );

      if (claimed.rows.length === 0) {
        console.log(`[Webhook] Duplicate event ${event.id} (${event.type}) — skipping`);
        return NextResponse.json({ received: true });
      }

      switch (event.type) {

        // ── Checkout completed → activate certificate with stored metrics ──
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const certificateId = session.metadata?.certificateId;
          const userId = session.metadata?.userId;

          if (!certificateId || !userId) {
            console.error('[Webhook] Missing certificateId or userId in session metadata');
            break;
          }

          const ownerCheck = await client.query(
            `SELECT user_id FROM certificates WHERE id = $1`,
            [certificateId]
          );
          if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== userId) {
            console.error(`[Webhook] Ownership mismatch for certificate ${certificateId}`);
            break;
          }

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
            await snapshotCertificateFromStored(client, certificateId, userId);
          } catch (err) {
            console.error('[Webhook] Failed to snapshot certificate:', err);
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

        // ── Monthly renewal → mark certificate as due for refresh ──────────
        // The user must manually reconnect Stripe to pull fresh metrics.
        // No access token is stored, so we cannot call Stripe automatically.
        case 'invoice.paid': {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription as string | null;
          if (!subscriptionId) break;

          // Only mark already-active certs (skip the first invoice, handled by checkout.session.completed)
          const certResult = await client.query(
            `SELECT id, user_id FROM certificates
             WHERE stripe_subscription_id = $1 AND is_active = true AND status = 'active'
               AND data_status = 'verified'`,
            [subscriptionId]
          );
          if (certResult.rows.length === 0) break;

          const { id: certId, user_id: certUserId } = certResult.rows[0];
          await client.query(
            `UPDATE certificates
             SET data_status = 'refresh_needed', updated_at = NOW()
             WHERE id = $1`,
            [certId]
          );
          console.log(`[Webhook] invoice.paid — certificate ${certId} (user ${certUserId}) marked refresh_needed`);
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

        // ── Subscription past_due / unpaid ────────────────────────────────
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const certId = subscription.metadata?.certificateId;
          const status = subscription.status;
          if (certId && (status === 'past_due' || status === 'unpaid')) {
            await client.query(
              `UPDATE certificates SET data_status = 'payment_failed', updated_at = NOW() WHERE id = $1`,
              [certId]
            );
            console.warn(`[Webhook] Certificate ${certId} payment issue — status: ${status}`);
          }
          break;
        }

        // ── Stripe account deauthorized ───────────────────────────────────
        // We call stripe.oauth.deauthorize() ourselves after every OAuth connect
        // (connect-fetch-disconnect model). That triggers this event too, so we
        // cannot safely set revoked_at here — it would silently revoke every new
        // connection. revoked_at is set only by the explicit /api/stripe/disconnect
        // endpoint when the user intentionally disconnects via our UI.
        case 'account.application.deauthorized': {
          const account = event.data.object as any;
          console.log(`[Webhook] account.application.deauthorized received for ${account.id} — no action (expected from connect-fetch-disconnect flow)`);
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

      await client.query(`UPDATE stripe_events SET processed = true WHERE id = $1`, [event.id]);
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
