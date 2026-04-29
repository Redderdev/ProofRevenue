'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo, Card, Metric, Sparkline } from '@/components/Common';
import { Pill, StateBadge } from '@/components/Badge';
import clsx from 'clsx';

interface DashboardProps {
  state?: string;
  activeNav?: 'dashboard' | 'certificate' | 'settings';
  onNav?: (screen: string) => void;
  onAction?: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state = 'unconnected',
  activeNav = 'dashboard',
  onNav,
  onAction,
}) => {
  return (
    <div className="bg-paper text-ink-900 min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-8 py-3.5 border-b border-line">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'certificate', label: 'Certificate' },
              { id: 'settings', label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNav?.(item.id)}
                className={clsx(
                  'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                  activeNav === item.id
                    ? 'text-ink-900 bg-white bg-opacity-40'
                    : 'text-ink-400 hover:text-ink-900'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-400">founder@caliai.co</span>
          <div className="w-6.5 h-6.5 rounded-full bg-ink-900 text-paper text-xs font-semibold flex items-center justify-center">
            f
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-1">
              Overview
            </div>
            <h1 className="font-serif text-5xl letter-spacing-tight">Your certificate</h1>
          </div>
          <StateBadge state={state} />
        </div>

        {/* Dashboard body based on state */}
        <DashboardBody state={state} onAction={onAction} />

        {/* Onboarding stepper */}
        <OnboardingStepper state={state} />
      </div>
    </div>
  );
};

const DashboardBody: React.FC<{
  state: string;
  onAction?: (action: string) => void;
}> = ({ state, onAction }) => {
  if (state === 'unconnected') return <StateUnconnected onAction={onAction} />;
  if (state === 'stripe_connected') return <StateConnected onAction={onAction} />;
  if (state === 'stripe_revoked_before_payment')
    return <StateRevokedPre onAction={onAction} />;
  if (state === 'payment_pending') return <StatePaymentPending />;
  if (state === 'data_pending') return <StateDataPending />;
  if (state === 'certificate_active') return <StateActive />;
  if (state === 'stripe_revoked_after_payment')
    return <StateRevokedPost />;
  return null;
};

const StateUnconnected: React.FC<{ onAction?: (action: string) => void }> = ({
  onAction,
}) => (
  <Card className="p-10 mb-8">
    <div className="grid grid-cols-2 gap-10">
      <div>
        <h2 className="font-serif text-2xl letter-spacing-tight mb-2.5">Connect Stripe to begin</h2>
        <p className="text-sm text-ink-600 mb-5 max-w-lg leading-relaxed">
          We use Stripe Connect to read your MRR, ARR and customer count. We never see or store
          your access token — only your Stripe account ID.
        </p>
        <Button variant="primary" onClick={() => onAction?.('connect')}>
          <Icon name="stripe-s" size={14} color="white" />
          Connect with Stripe
        </Button>
      </div>
      <div className="p-6 border border-line rounded-lg bg-paper-alt">
        <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-400 uppercase mb-3.5">
          What we read
        </div>
        {['Monthly recurring revenue', 'Annual recurring revenue', 'Customer count', 'Stripe livemode flag'].map(
          (item) => (
            <div key={item} className="flex items-center gap-2.5 py-2 text-sm">
              <Icon name="check" size={14} color="oklch(0.62 0.14 158)" />
              {item}
            </div>
          )
        )}
      </div>
    </div>
  </Card>
);

const StateConnected: React.FC<{ onAction?: (action: string) => void }> = ({
  onAction,
}) => {
  const [metrics, setMetrics] = useState<{
    mrr: number;
    arr: number;
    activeCustomers: number;
    livemode: boolean;
  } | null>(null);
  const [connection, setConnection] = useState<{
    stripeUserId: string;
    livemode: boolean;
    connectedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMetrics = async () => {
      try {
        const response = await fetch('/api/stripe/metrics', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load metrics');
        }

        const data = await response.json();

        if (!mounted) {
          return;
        }

        setMetrics(data.metrics || null);
        setConnection(data.connection || null);
        setError(null);
      } catch (err: any) {
        if (!mounted) {
          return;
        }
        setError(err?.message || 'Failed to load metrics');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (value: number) => {
    const amount = value / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stripeAccountLabel = connection?.stripeUserId
    ? `${connection.stripeUserId.slice(0, 8)}···${connection.stripeUserId.slice(-4)}`
    : 'Stripe connected';
  const modeLabel = connection?.livemode ? 'LIVEMODE' : 'TESTMODE';
  const connectedDate = connection?.connectedAt
    ? new Date(connection.connectedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="space-y-6 mb-8">
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="stripe-s" size={16} />
            <div>
              <div className="text-sm font-medium">{stripeAccountLabel}</div>
              <div className="font-mono text-xs text-ink-400">
                {modeLabel} · CONNECTED {connectedDate}
              </div>
            </div>
          </div>
          <Pill tone="emerald">Active</Pill>
        </div>
        <div className="flex">
          <Metric
            label="MRR (preview)"
            value={loading ? '—' : metrics ? formatCurrency(metrics.mrr) : '—'}
            sub={loading ? 'Loading…' : metrics ? `From ${metrics.activeCustomers.toLocaleString('en-US')} subscribers` : error || 'Unavailable'}
          />
          <Metric
            label="ARR (preview)"
            value={loading ? '—' : metrics ? formatCurrency(metrics.arr) : '—'}
            sub={loading ? 'Loading…' : metrics ? 'MRR × 12' : 'Unavailable'}
          />
          <Metric
            label="Customers"
            value={loading ? '—' : metrics ? metrics.activeCustomers.toLocaleString('en-US') : '—'}
            sub={loading ? 'Loading…' : metrics ? 'Active as of today' : 'Unavailable'}
          />
          <div className="flex-1 px-5 py-4.5 flex items-end">
            <Sparkline data={metrics ? [metrics.mrr] : [0]} width={120} height={40} />
          </div>
        </div>
      </Card>

      <Card className="p-7">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="font-serif text-2xl letter-spacing-tight mb-2">Ready to verify</h2>
            <p className="text-sm text-ink-600 mb-5 leading-relaxed">
              Pay €14.99 once. Your certificate is issued within seconds, and refreshed daily so
              your numbers stay current.
            </p>
            <div className="flex items-center gap-2.5">
              <Button variant="primary" size="lg" onClick={() => onAction?.('pay')}>
                Pay €14.99 · Issue certificate
                <Icon name="arrow-right" size={14} color="white" />
              </Button>
              <span className="font-mono text-xs text-ink-400">ONE-TIME · EUR</span>
            </div>
          </div>
          <div className="p-6 bg-paper-alt border border-line rounded-lg">
            <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-400 uppercase mb-3">
              Receipt preview
            </div>
            <div className="text-sm mb-2.5 flex justify-between">
              <span className="text-ink-600">Verified revenue certificate</span>
              <span className="font-mono">€14.99</span>
            </div>
            <div className="text-sm mb-2.5 flex justify-between">
              <span className="text-ink-600">VAT (reverse charge)</span>
              <span className="font-mono">—</span>
            </div>
            <div className="h-px bg-line my-2.5" />
            <div className="text-sm font-semibold flex justify-between">
              <span>Total</span>
              <span className="font-mono">€14.99</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StateRevokedPre: React.FC<{ onAction?: (action: string) => void }> = ({
  onAction,
}) => (
  <Card className="overflow-hidden mb-8">
    <div className="px-6 py-4 bg-ruby-soft border-b border-line flex items-center gap-3">
      <Icon name="warn" size={16} color="oklch(0.38 0.13 25)" />
      <div className="text-sm text-red-900">
        Your Stripe connection was disconnected. Reconnect to continue.
      </div>
    </div>
    <div className="p-10 flex justify-between items-center">
      <div>
        <h2 className="font-serif text-2xl letter-spacing-tight mb-2">Connection revoked</h2>
        <p className="text-sm text-ink-600 max-w-lg">
          Your Stripe connection for acct_1QrXz4···kpLm was disconnected on Apr 21, 2026. Payment
          is paused until you reconnect.
        </p>
      </div>
      <div className="flex gap-2.5">
        <Button variant="ghost">Contact support</Button>
        <Button variant="primary" onClick={() => onAction?.('connect')}>
          <Icon name="stripe-s" size={14} color="white" />
          Reconnect Stripe
        </Button>
      </div>
    </div>
  </Card>
);

const StatePaymentPending: React.FC = () => (
  <Card className="p-15 mb-8 text-center">
    <div className="w-12 h-12 rounded-full bg-amber-soft flex items-center justify-center mx-auto mb-5">
      <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
    </div>
    <h2 className="font-serif text-2xl letter-spacing-tight mb-2">Payment in progress…</h2>
    <p className="text-sm text-ink-600 max-w-lg mx-auto mb-6">
      We&apos;re waiting on Stripe to confirm your payment. This page updates automatically.
    </p>
    <div className="font-mono text-xs text-ink-400">
      SESSION cs_live_b1NxK···fQW4 · AMOUNT €14.99
    </div>
  </Card>
);

const StateDataPending: React.FC = () => {
  const [retry, setRetry] = useState(1);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : 30)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="overflow-hidden mb-8">
      <div className="px-6 py-4 bg-amber-soft border-b border-line flex items-center gap-3">
        <Icon name="clock" size={16} color="oklch(0.45 0.13 75)" />
        <div className="text-sm text-amber-900">
          Certificate issued. Revenue data loads within a few minutes.
        </div>
      </div>
      <div className="p-7">
        <h2 className="font-serif text-2xl letter-spacing-tight mb-5">Verifying your revenue</h2>
        <div className="grid grid-cols-4 gap-0 border border-line rounded-lg mb-6 overflow-hidden">
          <div className="px-4 py-3.5 border-r border-line">
            <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">Issued</div>
            <div className="text-sm mt-1">Apr 23, 2026 · 09:41 UTC</div>
          </div>
          <div className="px-4 py-3.5 border-r border-line">
            <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">Certificate</div>
            <div className="font-mono text-sm mt-1">cal9x2f4kn</div>
          </div>
          <div className="px-4 py-3.5 border-r border-line">
            <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">Retry count</div>
            <div className="font-mono text-sm mt-1">{retry}</div>
          </div>
          <div className="px-4 py-3.5">
            <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">Next refresh</div>
            <div className="font-mono text-sm mt-1">in {countdown}s</div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="ghost" onClick={() => setRetry((r) => r + 1)}>
            <Icon name="refresh" size={14} />
            Refresh now
          </Button>
          <span className="font-mono text-xs text-ink-400">AUTO-REFRESH EVERY 30s</span>
        </div>
      </div>
    </Card>
  );
};

const StateActive: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const certLink = 'https://proof.revenue/c/cal9x2f4kn';

  const copyLink = () => {
    navigator.clipboard?.writeText(certLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="p-7 mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <Icon name="shield-check" size={16} color="oklch(0.62 0.14 158)" />
        <span className="font-mono text-xs letter-spacing-wide text-emerald-ink uppercase">
          CERTIFICATE ACTIVE · VERIFIED APR 23, 2026 09:41 UTC
        </span>
      </div>
      <div className="flex items-center gap-3 p-2.5 border border-line rounded bg-paper-alt">
        <Icon name="link" size={14} color="var(--ink-400)" />
        <span className="font-mono text-sm flex-1">{certLink}</span>
        <Button variant="ghost" size="sm" onClick={copyLink}>
          {copied ? (
            <>
              <Icon name="check" size={12} color="oklch(0.62 0.14 158)" />
              Copied
            </>
          ) : (
            <>
              <Icon name="copy" size={12} />
              Copy
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

const StateRevokedPost: React.FC = () => (
  <Card className="p-7 mb-8">
    <div className="text-center">
      <Icon name="warn" size={16} color="oklch(0.48 0.14 75)" className="mx-auto mb-3" />
      <h2 className="font-serif text-2xl letter-spacing-tight mb-2">Re-verification needed</h2>
      <p className="text-sm text-ink-600 max-w-lg mx-auto">
        Your Stripe connection was revoked. Please reconnect to maintain your certificate.
      </p>
    </div>
  </Card>
);

const OnboardingStepper: React.FC<{ state: string }> = ({ state }) => {
  const stepMap: Record<string, number> = {
    unconnected: 0,
    stripe_connected: 1,
    stripe_revoked_before_payment: 1,
    payment_pending: 2,
    data_pending: 3,
    certificate_active: 4,
    stripe_revoked_after_payment: 4,
  };

  const step = stepMap[state] || 0;
  const steps = ['Register', 'Connect Stripe', 'Pay', 'Verify data', 'Share'];

  return (
    <div className="mt-14 pt-6 border-t border-line">
      <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-4">
        Onboarding
      </div>
      <div className="flex gap-0 items-stretch">
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className="flex-1 flex items-center gap-2.5">
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-semibold',
                  done && 'bg-emerald text-paper',
                  active && 'bg-ink-900 text-paper',
                  !done && !active && 'border border-line-strong text-ink-300'
                )}
              >
                {done ? <Icon name="check" size={12} color="white" /> : i + 1}
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="font-mono text-xs letter-spacing-wide text-ink-400">
                  STEP {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  className={clsx(
                    'text-xs',
                    done && 'text-ink-600',
                    active && 'text-ink-900 font-semibold',
                    !done && !active && 'text-ink-400'
                  )}
                >
                  {s}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={clsx('w-6 h-px mr-3', done ? 'bg-emerald' : 'bg-line')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
