/**
 * Stripe API Service
 * 
 * Server-side service for interacting with Stripe API.
 * All token handling is encrypted and server-only.
 * 
 * Functions:
 * - getRevenueMetrics: Calculate MRR, ARR, active customers
 * - fetchAndCacheMetrics: Fetch metrics and update database
 * - handleTokenRefresh: Refresh access tokens before expiration
 */

import pool from '@/lib/db';
import { decryptToken } from '@/lib/stripe-oauth';
import Stripe from 'stripe';

interface RevenueMetrics {
  mrr: number; // Monthly recurring revenue in cents
  arr: number; // Annual recurring revenue in cents
  activeCustomers: number; // Count of customers with active subscriptions
  totalRevenue: number; // Total revenue in cents (one-time + recurring)
  livemode: boolean; // Is this live mode or test mode
}

/**
 * Get Stripe API client for a specific connected account
 * Uses server-side encrypted tokens only
 */
const getStripeClient = async (userId: string): Promise<{ client: Stripe; stripeUserId: string } | null> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT stripe_user_id, access_token_encrypted, access_token_iv, livemode
       FROM stripe_connections
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn(`[Stripe API] No active connection for user: ${userId}`);
      return null;
    }

    const connection = result.rows[0];
    const accessToken = decryptToken(
      connection.access_token_encrypted.toString('hex'),
      connection.access_token_iv
    );

    const stripe = new Stripe(accessToken, {
      apiVersion: '2023-10-16',
    });

    return {
      client: stripe,
      stripeUserId: connection.stripe_user_id,
    };
  } finally {
    client.release();
  }
};

/**
 * Calculate revenue metrics from Stripe data
 * 
 * MRR = Sum of all active subscription amounts (normalized to monthly)
 * ARR = MRR × 12
 * Active Customers = Count of unique customers with active subscriptions
 * 
 * Handles different billing cycles (weekly, monthly, annual, etc.)
 */
export const getRevenueMetrics = async (userId: string): Promise<RevenueMetrics | null> => {
  try {
    const stripeData = await getStripeClient(userId);

    if (!stripeData) {
      console.warn(`[Stripe Metrics] No Stripe connection for user: ${userId}`);
      return null;
    }

    const { client: stripe, stripeUserId } = stripeData;
    const metrics: RevenueMetrics = {
      mrr: 0,
      arr: 0,
      activeCustomers: 0,
      totalRevenue: 0,
      livemode: false, // Will be set from database
    };

    // Get active customers with subscriptions (handle pagination)
    const customersWithSubscriptions = new Set<string>();
    let totalMrr = 0;

    try {
      // Fetch subscriptions (handles most revenue model)
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore) {
        const subscriptions = await stripe.subscriptions.list(
          {
            status: 'active',
            limit: 100,
            ...(startingAfter && { starting_after: startingAfter }),
          },
          {
            stripeAccount: stripeUserId, // Authenticate as connected account
          } as any
        );

        if (subscriptions.data.length === 0) {
          hasMore = false;
          break;
        }

        for (const subscription of subscriptions.data) {
          if (subscription.customer && typeof subscription.customer === 'string') {
            customersWithSubscriptions.add(subscription.customer);
          }

          // Calculate MRR from subscription items
          for (const item of subscription.items.data) {
            const plan = item.price?.recurring;

            if (plan && plan.interval) {
              // Normalize to monthly
              const monthlyAmount =
                plan.interval === 'month'
                  ? item.price?.unit_amount || 0
                  : plan.interval === 'year'
                    ? (item.price?.unit_amount || 0) / 12
                    : plan.interval === 'week'
                      ? ((item.price?.unit_amount || 0) * 52) / 12
                      : plan.interval === 'day'
                        ? ((item.price?.unit_amount || 0) * 365) / 12
                        : 0;

              totalMrr += monthlyAmount * (subscription.quantity || 1);
            }
          }

          // Add one-time charges
          metrics.totalRevenue += subscription.total_billing_cycle_sequence || 0;
        }

        // Check for more results
        hasMore = subscriptions.has_more || false;
        if (hasMore && subscriptions.data.length > 0) {
          startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
        }
      }

      metrics.mrr = Math.round(totalMrr);
      metrics.arr = Math.round(metrics.mrr * 12);
      metrics.activeCustomers = customersWithSubscriptions.size;

      console.log(`[Stripe Metrics] Calculated for user ${userId}:`, {
        mrr: metrics.mrr,
        arr: metrics.arr,
        activeCustomers: metrics.activeCustomers,
      });

      return metrics;
    } catch (error) {
      console.error(`[Stripe Metrics] Failed to fetch subscriptions:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`[Stripe Metrics] Error calculating metrics:`, error);
    throw error;
  }
};

/**
 * Fetch metrics and cache in database
 * Updates stripe_connections table and creates revenue_snapshot
 */
export const fetchAndCacheMetrics = async (userId: string): Promise<RevenueMetrics | null> => {
  const client = await pool.connect();

  try {
    // Get metrics from Stripe
    const metrics = await getRevenueMetrics(userId);

    if (!metrics) {
      throw new Error('Failed to fetch metrics');
    }

    // Update stripe_connections with latest metrics
    await client.query(
      `UPDATE stripe_connections
       SET mrr = $2,
           arr = $3,
           active_customers = $4,
           last_metrics_fetch = CURRENT_TIMESTAMP,
           metrics_fetch_error = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, metrics.mrr, metrics.arr, metrics.activeCustomers]
    );

    // Create historical snapshot
    await client.query(
      `INSERT INTO revenue_snapshots (user_id, stripe_connection_id, mrr, arr, active_customers, snapshot_date)
       SELECT $1, id, $2, $3, $4, CURRENT_DATE
       FROM stripe_connections
       WHERE user_id = $1
       ON CONFLICT (user_id, snapshot_date) DO UPDATE SET
         mrr = $2,
         arr = $3,
         active_customers = $4`,
      [userId, metrics.mrr, metrics.arr, metrics.activeCustomers]
    );

    console.log(`[Stripe Metrics] Cached metrics for user ${userId}`);

    return metrics;
  } catch (error) {
    console.error(`[Stripe Metrics] Cache error:`, error);

    // Log error to database
    await client.query(
      `UPDATE stripe_connections
       SET metrics_fetch_error = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, String(error).substring(0, 255)]
    ).catch(() => {});

    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get cached metrics from database (fast path)
 * Returns metrics from last successful fetch
 */
export const getCachedMetrics = async (
  userId: string,
  maxAgeMins: number = 60
): Promise<RevenueMetrics | null> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT mrr, arr, active_customers, livemode, last_metrics_fetch
       FROM stripe_connections
       WHERE user_id = $1
       AND last_metrics_fetch > NOW() - INTERVAL '${maxAgeMins} minutes'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      mrr: row.mrr || 0,
      arr: row.arr || 0,
      activeCustomers: row.active_customers || 0,
      totalRevenue: 0, // Not cached
      livemode: row.livemode || false,
    };
  } finally {
    client.release();
  }
};

/**
 * Check if metrics need refresh
 */
export const shouldRefreshMetrics = async (userId: string, maxAgeMins: number = 60): Promise<boolean> => {
  const cached = await getCachedMetrics(userId, maxAgeMins);
  return cached === null;
};
