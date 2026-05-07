'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dashboard, CertificateData } from '@/components/screens/Dashboard';

export const dynamic = 'force-dynamic';

type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_error'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'payment_abandoned'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

function certRowToState(cert: {
  status: string;
  data_status: string;
  is_active: boolean;
} | null): DashboardState | null {
  if (!cert) return null;
  if (cert.status === 'draft') return 'payment_pending';
  if (cert.status === 'active' && cert.data_status === 'verified') return 'certificate_active';
  if (cert.status === 'active') return 'data_pending';
  return null;
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';

  const paymentCancelled = searchParams.get('payment') === 'cancelled';

  const [state, setState] = useState<DashboardState>(
    paymentSuccess ? 'payment_pending' : 'unconnected'
  );
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Poll /api/certificate/status until the cert is active and verified
  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/certificate/status', { credentials: 'include' });
        if (!res.ok) return;
        const { certificate: cert } = await res.json();
        const next = certRowToState(cert);
        if (next) {
          setState(next);
          if (cert) setCertificate({
            id: cert.id,
            verifiedAt: cert.verified_at,
            issuedAt: cert.issued_at,
            mrr: cert.mrr,
            arr: cert.arr,
            customers: cert.customers,
          });
          if (next === 'certificate_active') stopPolling();
        }
      } catch {
        // ignore transient errors during polling
      }
    }, 5000);
  };

  useEffect(() => {
    let mounted = true;

    const cancelDraft = () =>
      fetch('/api/certificate/cancel-draft', { method: 'POST', credentials: 'include' }).catch(() => {});

    const loadStripeConnection = async () => {
      const metricsRes = await fetch('/api/stripe/metrics', { credentials: 'include' });
      if (!mounted) return;
      if (metricsRes.ok) {
        const data = await metricsRes.json().catch(() => ({}));
        if (data.connection) { setState('stripe_connected'); return; }
        if (data.connectStatus?.failedAt) { setState('stripe_error'); return; }
      }
      setState('unconnected');
    };

    const loadState = async () => {
      try {
        const certRes = await fetch('/api/certificate/status', { credentials: 'include' });
        if (certRes.ok) {
          const { certificate: cert } = await certRes.json();

          if (cert?.status === 'draft') {
            if (paymentCancelled) {
              // User clicked Cancel on Stripe — silently clean up and show connect state
              await cancelDraft();
              await loadStripeConnection();
            } else {
              // User navigated back manually — show recovery UI, don't auto-cancel
              if (mounted) setState('payment_abandoned');
            }
            return;
          }

          const certState = certRowToState(cert);
          if (certState && mounted) {
            setState(certState);
            if (cert) setCertificate({
              id: cert.id,
              verifiedAt: cert.verified_at,
              issuedAt: cert.issued_at,
              mrr: cert.mrr,
              arr: cert.arr,
              customers: cert.customers,
            });
            if (certState === 'data_pending') startPolling();
            return;
          }
        }

        await loadStripeConnection();
      } catch {
        if (mounted) setState('stripe_error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (paymentSuccess) {
      // Stripe redirected back after successful payment — start polling for webhook
      setLoading(false);
      startPolling();
    } else {
      loadState();
    }

    return () => {
      mounted = false;
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (action: string) => {
    if (action === 'connect') {
      router.push('/connect/stripe');
      return;
    }
    if (action === 'pay') {
      router.push('/checkout');
      return;
    }
    if (action === 'cancel_draft') {
      await fetch('/api/certificate/cancel-draft', { method: 'POST', credentials: 'include' });
      router.replace('/dashboard');
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
    router.push('/dashboard');
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
      certificate={certificate}
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
