'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo, Card } from '@/components/Common';
import { eur, num, maskStripeId } from '@/lib/utils';

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
      <div className="bg-paper min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs text-ink-400 animate-pulse">Loading certificate…</div>
      </div>
    );
  }

  // No certificate
  if (!cert) {
    return (
      <div className="bg-paper min-h-screen px-4 sm:px-8 py-16">
        <div className="max-w-lg mx-auto text-center">
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
      <div className="bg-paper min-h-screen px-4 sm:px-8 py-16">
        <div className="max-w-lg mx-auto text-center">
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

  // Active certificate — show real data
  const verifiedAt = cert.verified_at || cert.issued_at;
  const twitterText = encodeURIComponent('Our revenue is independently verified — check the certificate:');
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(certUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;

  return (
    <div className="bg-paper min-h-screen font-sans overflow-x-hidden">
      {/* Top bar */}
      <div className="border-b border-line px-4 sm:px-8 py-4 flex items-center justify-between bg-white">
        <Logo size={14} />
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block font-mono text-xs text-ink-400">
            {certUrl.replace(/^https?:\/\//, '')}
          </span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
          >
            {copied ? '✓ Copied' : '⎘ Copy link'}
          </button>
          {certUrl && (
            <a
              href={certUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
            >
              View public
              <Icon name="external" size={10} color="var(--ink-400)" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
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
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
          >
            Share on X
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
          >
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
              <span className="text-ink-600">Certificate ID</span>
              <span className="font-mono">{cert.id}</span>
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
                <span className="font-mono">{maskStripeId(conn.stripeUserId)}</span>
              </div>
            )}
            {conn?.country && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Country</span>
                <span className="font-mono">{conn.country.toUpperCase()}</span>
              </div>
            )}
          </div>
          {certUrl && (
            <div className="mt-4 pt-4 border-t border-line">
              <a
                href={certUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition-colors"
              >
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
