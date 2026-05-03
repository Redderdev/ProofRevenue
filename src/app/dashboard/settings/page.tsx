'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Common';
import { useAuth } from '@/lib/AuthContext';

interface ConnectionInfo {
  stripeUserId: string;
  livemode: boolean;
  connectedAt: string;
  displayName?: string | null;
  displayUrl?: string | null;
  country?: string | null;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState('');

  useEffect(() => {
    fetch('/api/stripe/metrics')
      .then((r) => r.json())
      .then((d) => setConnection(d.connection ?? null))
      .catch(() => {})
      .finally(() => setLoadingConnection(false));
  }, []);

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Stripe account? Your certificate will be deactivated.')) return;
    setDisconnecting(true);
    setDisconnectError('');
    try {
      const res = await fetch('/api/stripe/disconnect', { method: 'POST' });
      if (!res.ok) {
        const d = await res.json();
        setDisconnectError(d.error || 'Failed to disconnect');
        return;
      }
      router.push('/dashboard');
    } catch {
      setDisconnectError('Something went wrong. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  };

  const shortId = connection?.stripeUserId
    ? `${connection.stripeUserId.slice(0, 8)}···${connection.stripeUserId.slice(-4)}`
    : null;

  return (
    <main className="min-h-screen bg-paper text-ink-900">
      <div className="flex items-center justify-between px-8 py-3.5 border-b border-line">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12 space-y-10">
        <h1 className="font-serif text-5xl tracking-tight">Settings</h1>

        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono tracking-widest text-ink-400 uppercase">Account</h2>
          <div className="border border-line rounded-xl divide-y divide-line">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-ink-600">Email</span>
              <span className="text-sm font-medium text-ink-900">{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-ink-600">Account ID</span>
              <span className="text-sm font-mono text-ink-400">{user?.id?.slice(0, 8)}···</span>
            </div>
          </div>
        </section>

        {/* Stripe Connection */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono tracking-widest text-ink-400 uppercase">Stripe Connection</h2>
          <div className="border border-line rounded-xl divide-y divide-line">
            {loadingConnection ? (
              <div className="px-5 py-4 text-sm text-ink-400">Loading…</div>
            ) : connection ? (
              <>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-ink-600">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Connected
                  </span>
                </div>
                {connection.displayName && (
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm text-ink-600">Account name</span>
                    <span className="text-sm font-medium text-ink-900">{connection.displayName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-ink-600">Account ID</span>
                  <span className="text-sm font-mono text-ink-400">{shortId}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-ink-600">Mode</span>
                  <span className={`text-sm font-medium ${connection.livemode ? 'text-ink-900' : 'text-amber-600'}`}>
                    {connection.livemode ? 'Live' : 'Test'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-ink-600">Connected</span>
                  <span className="text-sm text-ink-900">
                    {new Date(connection.connectedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-ink-600">Access granted</span>
                  <span className="text-sm text-ink-900">Read-only</span>
                </div>
                <div className="px-5 py-4">
                  {disconnectError && (
                    <p className="text-sm text-red-600 mb-3">{disconnectError}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    loading={disconnecting}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    Disconnect Stripe
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-ink-600">Status</span>
                <span className="text-sm text-ink-400">Not connected</span>
              </div>
            )}
          </div>
        </section>

        {/* What we access */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono tracking-widest text-ink-400 uppercase">Data Access</h2>
          <div className="border border-line rounded-xl p-5 space-y-4">
            <p className="text-sm text-ink-600">
              ProofRevenue uses <strong>read-only</strong> Stripe Connect OAuth. Here is exactly what we read and what we never touch:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono tracking-widest text-emerald-700 uppercase mb-2">We read</p>
                <ul className="text-sm text-ink-700 space-y-1">
                  <li>✓ Active subscriptions (count + amounts)</li>
                  <li>✓ Subscription billing intervals</li>
                  <li>✓ MRR / ARR calculations</li>
                  <li>✓ Active customer count</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono tracking-widest text-red-600 uppercase mb-2">We never read</p>
                <ul className="text-sm text-ink-700 space-y-1">
                  <li>✗ Card numbers or bank details</li>
                  <li>✗ Customer names or emails</li>
                  <li>✗ Payout information</li>
                  <li>✗ Individual transaction data</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-ink-400 pt-2 border-t border-line">
              We never create charges, issue refunds, or modify anything in your Stripe account.
              You can revoke access at any time above or directly in your{' '}
              <a
                href="https://dashboard.stripe.com/settings/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe dashboard
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
