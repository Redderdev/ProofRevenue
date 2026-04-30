'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dashboard } from '@/components/screens/Dashboard';

export const dynamic = 'force-dynamic';

type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_error'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

const allowedStates: DashboardState[] = [
  'unconnected',
  'stripe_connected',
  'stripe_error',
  'stripe_revoked_before_payment',
  'payment_pending',
  'data_pending',
  'certificate_active',
  'stripe_revoked_after_payment',
];

function getDashboardState(param: string | null): DashboardState {
  if (param && allowedStates.includes(param as DashboardState)) {
    return param as DashboardState;
  }
  return 'unconnected';
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  const resolvedParamState = useMemo(
    () => getDashboardState(stateParam),
    [stateParam]
  );
  const [state, setState] = useState<DashboardState>(resolvedParamState);
  const [loading, setLoading] = useState(stateParam === null);

  useEffect(() => {
    if (stateParam !== null) {
      setState(resolvedParamState);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadState = async () => {
      try {
        const response = await fetch('/api/stripe/metrics', {
          method: 'GET',
          credentials: 'include',
        });

        if (!mounted) {
          return;
        }

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          if (data.connection) {
            setState('stripe_connected');
            return;
          }
          if (data.connectStatus?.failedAt) {
            setState('stripe_error');
            return;
          }
          setState('unconnected');
          return;
        }

        setState('stripe_error');
      } catch (error) {
        if (mounted) {
          setState('stripe_error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, [resolvedParamState, stateParam]);

  const handleAction = (action: string) => {
    if (action === 'connect') {
      router.push('/connect/stripe');
      return;
    }
    if (action === 'pay') {
      router.push('/checkout');
    }
  };

  const handleNav = (screen: string) => {
    if (screen === 'certificate') {
      router.push('/dashboard/certificate');
      return;
    }
    if (screen === 'settings') {
      router.push('/dashboard/settings');
      return;
    }
    router.push(`/dashboard?state=${state}`);
  };

  if (loading) {
    return <main className="min-h-screen bg-paper" />;
  }

  return (
    <Dashboard
      state={state}
      activeNav="dashboard"
      onAction={handleAction}
      onNav={handleNav}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" />}>
      <DashboardPageContent />
    </Suspense>
  );
}
