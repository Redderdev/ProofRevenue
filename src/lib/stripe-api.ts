import pool from '@/lib/db';
import Stripe from 'stripe';

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  activeCustomers: number;
  totalRevenue: number;
  livemode: boolean;
}

export interface StripeConnectionSummary {
  stripeUserId: string;
  livemode: boolean;
  connectedAt: string;
  displayName?: string | null;
  displayUrl?: string | null;
  country?: string | null;
}

export interface StripeConnectStatus {
  attemptedAt: string | null;
  failedAt: string | null;
}

// Core subscription calculation — takes an already-authenticated Stripe instance.
// The instance is created in-memory during OAuth and discarded immediately after.
const calculateRevenueMetrics = async (stripe: Stripe): Promise<RevenueMetrics> => {
  const customersWithSubscriptions = new Set<string>();
  let totalMrr = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
    });

    if (subscriptions.data.length === 0) { hasMore = false; break; }

    for (const sub of subscriptions.data) {
      if (sub.customer && typeof sub.customer === 'string') {
        customersWithSubscriptions.add(sub.customer);
      }
      for (const item of sub.items.data) {
        const plan = item.price?.recurring;
        if (plan?.interval) {
          const monthlyAmount =
            plan.interval === 'month' ? (item.price?.unit_amount || 0) :
            plan.interval === 'year'  ? (item.price?.unit_amount || 0) / 12 :
            plan.interval === 'week'  ? ((item.price?.unit_amount || 0) * 52) / 12 :
            plan.interval === 'day'   ? ((item.price?.unit_amount || 0) * 365) / 12 : 0;
          totalMrr += monthlyAmount * (item.quantity || 1);
        }
      }
    }

    hasMore = subscriptions.has_more || false;
    if (hasMore && subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }

  const mrr = Math.round(totalMrr);
  return {
    mrr,
    arr: mrr * 12,
    activeCustomers: customersWithSubscriptions.size,
    totalRevenue: 0,
    livemode: false,
  };
};

/**
 * Fetch revenue metrics using an in-memory access token.
 * Called during the OAuth callback — the token is never written to disk.
 */
export const fetchMetricsWithToken = async (accessToken: string): Promise<RevenueMetrics | null> => {
  try {
    const stripe = new Stripe(accessToken, { apiVersion: '2023-10-16' });
    const metrics = await calculateRevenueMetrics(stripe);
    console.log(`[Stripe API] Metrics fetched: mrr=${metrics.mrr}, customers=${metrics.activeCustomers}`);
    return metrics;
  } catch (error) {
    console.error('[Stripe API] fetchMetricsWithToken failed:', error);
    return null;
  }
};

/**
 * Persist a metrics snapshot to the database after a successful OAuth fetch.
 * This is the only DB write path — no token is stored alongside it.
 */
export const storeConnectionMetrics = async (userId: string, metrics: RevenueMetrics): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE stripe_connections
       SET mrr = $2, arr = $3, active_customers = $4,
           last_metrics_fetch = CURRENT_TIMESTAMP,
           metrics_fetch_error = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, metrics.mrr, metrics.arr, metrics.activeCustomers]
    );

    await client.query(
      `INSERT INTO revenue_snapshots (user_id, stripe_connection_id, mrr, arr, active_customers, snapshot_date)
       SELECT $1, id, $2, $3, $4, CURRENT_DATE
       FROM stripe_connections WHERE user_id = $1
       ON CONFLICT (user_id, snapshot_date) DO UPDATE
         SET mrr = $2, arr = $3, active_customers = $4`,
      [userId, metrics.mrr, metrics.arr, metrics.activeCustomers]
    );
  } finally {
    client.release();
  }
};

/**
 * Read the most recently stored metrics snapshot from the database.
 * No Stripe API call — fast DB read only.
 */
export const getStoredMetrics = async (userId: string): Promise<RevenueMetrics | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT mrr, arr, active_customers, livemode, last_metrics_fetch
       FROM stripe_connections
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    if (result.rows.length === 0 || result.rows[0].last_metrics_fetch === null) return null;
    const row = result.rows[0];
    return {
      mrr: row.mrr || 0,
      arr: row.arr || 0,
      activeCustomers: row.active_customers || 0,
      totalRevenue: 0,
      livemode: row.livemode || false,
    };
  } finally {
    client.release();
  }
};

export const getStripeConnectionSummary = async (userId: string): Promise<StripeConnectionSummary | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT stripe_user_id, livemode, connected_at, account_name, account_url, account_country
       FROM stripe_connections
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      stripeUserId: row.stripe_user_id,
      livemode: row.livemode === true,
      connectedAt: row.connected_at?.toISOString?.() ?? String(row.connected_at),
      displayName: row.account_name,
      displayUrl: row.account_url,
      country: row.account_country,
    };
  } finally {
    client.release();
  }
};

export const getStripeConnectStatus = async (userId: string): Promise<StripeConnectStatus> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT stripe_connect_attempted_at, stripe_connect_failed_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return { attemptedAt: null, failedAt: null };
    const row = result.rows[0];
    return {
      attemptedAt: row.stripe_connect_attempted_at
        ? row.stripe_connect_attempted_at.toISOString?.() ?? String(row.stripe_connect_attempted_at)
        : null,
      failedAt: row.stripe_connect_failed_at
        ? row.stripe_connect_failed_at.toISOString?.() ?? String(row.stripe_connect_failed_at)
        : null,
    };
  } finally {
    client.release();
  }
};
