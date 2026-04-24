'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/AuthContext';

type CallbackState = 'loading' | 'success' | 'error' | 'redirecting';

export default function StripeConnectCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refresh } = useAuth();
  const [state, setState] = useState<CallbackState>('loading');
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get('success') === 'true';
  const livemode = searchParams.get('livemode') === 'true';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!success) {
          setState('error');
          setError('OAuth connection was not successful');
          return;
        }

        // Refresh user context to get updated stripe connection status
        await refresh();

        // Wait a moment for user to see the success message
        setState('success');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to dashboard with appropriate state
        setState('redirecting');
        const dashboardUrl = new URL('/dashboard', window.location.origin);
        dashboardUrl.searchParams.set('state', livemode ? 'stripe_connected_live' : 'stripe_connected');
        router.replace(dashboardUrl.pathname + dashboardUrl.search);
      } catch (err) {
        console.error('[Callback] Error:', err);
        setState('error');
        setError(err instanceof Error ? err.message : 'Failed to complete connection');
      }
    };

    if (user) {
      handleCallback();
    }
  }, [user, success, livemode, refresh, router]);

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center max-w-md">
        {state === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-soft mx-auto mb-4 flex items-center justify-center animate-spin">
              <Icon name="loader" size={24} color="oklch(0.62 0.14 262)" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl letter-spacing-tight text-ink-900 mb-2">
              Connecting Stripe...
            </h1>
            <p className="text-sm text-ink-600">
              Verifying your connection and loading your revenue data
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-soft mx-auto mb-4 flex items-center justify-center">
              <Icon name="check" size={24} color="oklch(0.62 0.14 158)" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl letter-spacing-tight text-ink-900 mb-2">
              Stripe Connected!
            </h1>
            <p className="text-sm text-ink-600">
              {livemode
                ? 'Your live Stripe account is connected'
                : 'Your test Stripe account is connected'}
            </p>
            <p className="text-xs text-ink-400 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-soft mx-auto mb-4 flex items-center justify-center">
              <Icon name="alert" size={24} color="oklch(0.62 0.14 30)" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl letter-spacing-tight text-ink-900 mb-2">
              Connection Failed
            </h1>
            <p className="text-sm text-ink-600 mb-4">{error || 'An error occurred'}</p>
            <button
              onClick={() => router.push('/dashboard?state=stripe_error')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm w-full"
            >
              Return to Dashboard
            </button>
          </>
        )}

        {state === 'redirecting' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-soft mx-auto mb-4 flex items-center justify-center">
              <Icon name="check" size={24} color="oklch(0.62 0.14 158)" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl letter-spacing-tight text-ink-900 mb-2">
              Redirecting...
            </h1>
            <p className="text-sm text-ink-600">Taking you to your dashboard</p>
          </>
        )}
      </div>
    </main>
  );
}
