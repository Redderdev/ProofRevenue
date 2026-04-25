'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dashboard } from '@/components/screens/Dashboard';

export const dynamic = 'force-dynamic';

type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

const allowedStates: DashboardState[] = [
  'unconnected',
  'stripe_connected',
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
  const state = getDashboardState(searchParams.get('state'));

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
