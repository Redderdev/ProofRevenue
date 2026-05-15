'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo, Card } from '@/components/Common';
import { useAuth } from '@/lib/AuthContext';
import { eur, num, maskStripeId } from '@/lib/utils';
import clsx from 'clsx';

interface CertificatePageProps {
  onNav?: (screen: string) => void;
}

interface CertData {
  id: string;
  status: string;
  data_status: string;
  is_active: boolean;
  issued_at: string | null;
  verified_at: string | null;
  mrr: number | null;
  arr: number | null;
  customers: number | null;
  view_count: number;
}

interface ConnData {
  stripeUserId: string;
  livemode: boolean;
  connectedAt: string;
  displayName?: string | null;
  displayUrl?: string | null;
  country?: string | null;
}

function fmtDatetime(d: string | null): string {
  if (!d) return '—';
  const date = new Date(d);
  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) +
    ' UTC'
  );
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'settings', label: 'Settings' },
];

const DashboardNav: React.FC<{ onNav?: (screen: string) => void }> = ({ onNav }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setMenuOpen(false);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="relative border-b border-line">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5">
        {/* Left: logo + tabs */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Logo />
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav?.(item.id)}
                className={clsx(
                  'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                  item.id === 'certificate'
                    ? 'text-ink-900 bg-white bg-opacity-40'
                    : 'text-ink-400 hover:text-ink-900'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: desktop email+avatar | mobile hamburger */}
        <div className="hidden md:flex items-center gap-3">
          <span className="font-mono text-xs text-ink-400">{user?.email}</span>
          <div className="w-6 h-6 rounded-full bg-ink-900 text-paper text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded text-ink-600 hover:text-ink-900 hover:bg-paper-alt transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNav?.(item.id); setMenuOpen(false); }}
              className={clsx(
                'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                item.id === 'certificate'
                  ? 'bg-paper text-ink-900'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-paper'
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-line pt-2 mt-2">
            <div className="px-3 py-1.5 font-mono text-xs text-ink-400">{user?.email}</div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CertificatePage: React.FC<CertificatePageProps> = ({ onNav }) => {
  const [cert, setCert] = useState<CertData | null | undefined>(undefined);
  const [conn, setConn] = useState<ConnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [certRes, metricsRes] = await Promise.all([
          fetch('/api/certificate/status', { credentials: 'include' }),
          fetch('/api/stripe/metrics', { credentials: 'include' }),
        ]);
        const certData = await certRes.json().catch(() => ({}));
        const metricsData = await metricsRes.json().catch(() => ({}));
        if (!mounted) return;
        setCert(certData.certificate ?? null);
        setConn(metricsData.connection ?? null);
      } catch {
        if (mounted) setCert(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const certUrl = cert?.id ? `${appUrl}/c/${cert.id}` : '';

  const copy = () => {
    if (certUrl) navigator.clipboard?.writeText(certUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const companyName = conn?.displayName?.trim()
    ? conn.displayName
    : conn?.displayUrl
      ? new URL(conn.displayUrl).hostname.replace(/^www\./, '')
      : conn?.stripeUserId
        ? maskStripeId(conn.stripeUserId)
        : 'Your business';

  const domain = conn?.displayUrl
    ? new URL(conn.displayUrl).hostname.replace(/^www\./, '')
    : null;

  // Loading
  if (loading) {
    return (
      <div className="bg-paper min-h-screen overflow-x-hidden">
        <DashboardNav onNav={onNav} />
        <div className="flex items-center justify-center py-32">
          <div className="font-mono text-xs text-ink-400 animate-pulse">Loading certificate…</div>
        </div>
      </div>
    );
  }

  // No certificate
  if (!cert) {
    return (
      <div className="bg-paper min-h-screen overflow-x-hidden">
        <DashboardNav onNav={onNav} />
        <div className="max-w-lg mx-auto px-4 sm:px-8 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-line flex items-center justify-center mx-auto mb-5">
            <Icon name="shield-check" size={20} color="var(--ink-400)" />
          </div>
          <h2 className="font-serif text-2xl tracking-tight mb-2">No certificate yet</h2>
          <p className="text-sm text-ink-600 leading-relaxed mb-6">
            You haven&apos;t issued a verified certificate. Connect Stripe and subscribe to get one.
          </p>
          <Button variant="primary" onClick={() => onNav?.('dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Data pending
  if (!cert.is_active || cert.data_status === 'pending') {
    return (
      <div className="bg-paper min-h-screen overflow-x-hidden">
        <DashboardNav onNav={onNav} />
        <div className="max-w-lg mx-auto px-4 sm:px-8 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-soft flex items-center justify-center mx-auto mb-5">
            <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl tracking-tight mb-2">Verifying your revenue</h2>
          <p className="text-sm text-ink-600 leading-relaxed mb-2">
            Your certificate was issued. Revenue data is being pulled from Stripe — this takes a few minutes.
          </p>
          <p className="font-mono text-xs text-ink-400">CERT ID: {cert.id}</p>
        </div>
      </div>
    );
  }

  // Active certificate
  const verifiedAt = cert.verified_at || cert.issued_at;
  const twitterText = encodeURIComponent('Our revenue is independently verified — check the certificate:');
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(certUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;

  return (
    <div className="bg-paper min-h-screen font-sans overflow-x-hidden">
      <DashboardNav onNav={onNav} />

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-14">

        {/* Company header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-soft border border-emerald rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            <span className="font-mono text-xs text-emerald-ink">
              Certificate active · {conn?.livemode ? 'LIVEMODE' : 'TESTMODE'}
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight mb-1">
            {companyName}
          </h1>
          {domain && <p className="font-mono text-sm text-ink-400 mb-4">{domain}</p>}
          <p className="text-sm text-ink-600 leading-relaxed max-w-lg">
            Revenue independently verified against Stripe, snapshotted on{' '}
            <span className="text-ink-900 font-medium">{fmtDatetime(verifiedAt)}</span>.
          </p>
        </div>

        {/* MRR hero card */}
        <Card className="p-6 sm:p-8 mb-4">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">
            Monthly Recurring Revenue
          </div>
          <div className="font-serif text-5xl sm:text-6xl leading-none tracking-tight">
            {cert.mrr != null ? eur(cert.mrr / 100) : '—'}
          </div>
        </Card>

        {/* ARR + Customers */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <Card className="p-5 sm:p-6">
            <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Annual Recurring</div>
            <div className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight">
              {cert.arr != null ? eur(cert.arr / 100) : '—'}
            </div>
            <div className="font-mono text-xs text-ink-400 mt-2">MRR × 12</div>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">Active Customers</div>
            <div className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight">
              {cert.customers != null ? num(cert.customers) : '—'}
            </div>
            <div className="font-mono text-xs text-ink-400 mt-2">With paid subscriptions</div>
          </Card>
        </div>

        {/* Verification timestamp */}
        <div className="flex items-center gap-2.5 py-3 px-4 bg-white border border-line rounded-xl mb-6 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />
          <span className="font-mono text-xs text-ink-600 truncate">
            Verified {fmtDatetime(verifiedAt)} · refreshes monthly
          </span>
        </div>

        {/* Share row */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
          >
            {copied ? '✓ Copied' : '⎘ Copy link'}
          </button>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700">
            Share on X
          </a>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700">
            Share on LinkedIn
          </a>
        </div>

        {/* Certificate details */}
        <Card className="p-5 sm:p-6">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">
            Certificate details
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Certificate views</span>
              <span className="font-mono text-xs">{num(cert.view_count ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Certificate ID</span>
              <span className="font-mono text-xs">{cert.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Issued</span>
              <span className="font-mono text-xs">{fmtDatetime(cert.issued_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Last verified</span>
              <span className="font-mono text-xs">{fmtDatetime(cert.verified_at)}</span>
            </div>
            {conn?.stripeUserId && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Stripe account</span>
                <span className="font-mono text-xs">{maskStripeId(conn.stripeUserId)}</span>
              </div>
            )}
            {conn?.country && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Country</span>
                <span className="font-mono text-xs">{conn.country.toUpperCase()}</span>
              </div>
            )}
          </div>
          {certUrl && (
            <div className="mt-4 pt-4 border-t border-line">
              <a href={certUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition-colors">
                <Icon name="external" size={12} color="currentColor" />
                View public certificate page
              </a>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};
