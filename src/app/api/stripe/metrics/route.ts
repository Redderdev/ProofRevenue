/**
 * GET /api/stripe/metrics
 *
 * Returns stored revenue metrics from the database.
 * No Stripe API call is made — metrics are snapshotted at OAuth connect time
 * and updated when the user manually reconnects each billing cycle.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { getStoredMetrics, getStripeConnectionSummary, getStripeConnectStatus } from '@/lib/stripe-api';

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
    const [metrics, connection, connectStatus] = await Promise.all([
      getStoredMetrics(userId),
      getStripeConnectionSummary(userId),
      getStripeConnectStatus(userId),
    ]);

    return NextResponse.json({
      metrics,
      connection,
      connectStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
