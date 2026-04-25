/**
 * GET /api/stripe/metrics
 * 
 * Fetches current revenue metrics for authenticated user.
 * Returns cached metrics if available (within last 60 mins),
 * otherwise fetches fresh data from Stripe API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getCachedMetrics, fetchAndCacheMetrics, shouldRefreshMetrics } from '@/lib/stripe-api';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret');

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const verified = await jwtVerify(accessToken, JWT_SECRET);
      userId = verified.payload.userId as string;

      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if we need to refresh (cache older than 60 minutes)
    const needsRefresh = await shouldRefreshMetrics(userId, 60);

    if (needsRefresh) {
      // Fetch fresh data from Stripe
      try {
        const metrics = await fetchAndCacheMetrics(userId);

        if (!metrics) {
          return NextResponse.json(
            { error: 'No Stripe connection found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          metrics,
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
