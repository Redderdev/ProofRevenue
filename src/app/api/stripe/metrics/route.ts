/**
 * GET /api/stripe/metrics
 * 
 * Fetches current revenue metrics for authenticated user.
 * Returns cached metrics if available (within last 60 mins),
 * otherwise fetches fresh data from Stripe API.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getCachedMetrics, fetchAndCacheMetrics, getStripeConnectionSummary, getStripeConnectStatus, shouldRefreshMetrics } from '@/lib/stripe-api';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const connection = await getStripeConnectionSummary(userId);
    const connectStatus = await getStripeConnectStatus(userId);

    if (!connection) {
      return NextResponse.json({
        metrics: null,
        connection: null,
        connectStatus,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if we need to refresh (cache older than 60 minutes)
    const needsRefresh = await shouldRefreshMetrics(userId, 60);

    if (needsRefresh) {
      // Fetch fresh data from Stripe
      try {
        const metrics = await fetchAndCacheMetrics(userId);

        if (!metrics) {
          return NextResponse.json({
            metrics: null,
            connection,
            connectStatus,
            cached: true,
            timestamp: new Date().toISOString(),
          });
        }

        return NextResponse.json({
          metrics,
          connection,
          connectStatus,
          cached: false,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[Metrics API] Fetch error:', error);

        // Try to return cached data even if refresh failed
        const cached = await getCachedMetrics(userId, 24 * 60); // 24 hours
        if (cached) {
          return NextResponse.json({
            metrics: cached,
            connection,
            connectStatus,
            cached: true,
            error: 'Failed to refresh, returning cached data',
            timestamp: new Date().toISOString(),
          });
        }

        return NextResponse.json(
          { error: 'Failed to fetch metrics' },
          { status: 500 }
        );
      }
    }

    // Return cached metrics (fresh)
    const cached = await getCachedMetrics(userId, 60);

    return NextResponse.json({
      metrics: cached,
      connection,
      connectStatus,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
