import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import pool from '@/lib/db';
import { Sparkline } from '@/components/Common';
import CopyLinkButton from './CopyLinkButton';

export const dynamic = 'force-dynamic';

function fmt(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtDate(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDatetime(d: Date | string | null): string {
  if (!d) return '—';
  const date = new Date(d);
  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false }) +
    ' UTC'
  );
}

export async function generateMetadata({
  params,
}: {
  params: { certificateId: string };
}): Promise<Metadata> {
  const result = await pool.query(
    `SELECT c.mrr, sc.account_name, sc.account_url, sc.stripe_user_id
     FROM certificates c
     JOIN stripe_connections sc ON sc.user_id = c.user_id
     WHERE c.id = $1 AND c.is_public = true AND c.is_active = true`,
    [params.certificateId]
  );
  if (result.rows.length === 0) {
    return { robots: { index: false, follow: false } };
  }
  const row = result.rows[0];
  const companyName =
    row.account_name?.trim() ||
    (row.account_url ? new URL(row.account_url).hostname.replace(/^www\./, '') : row.stripe_user_id);
  const mrr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format((row.mrr ?? 0) / 100);
  const title = `${companyName} — ${mrr} MRR`;
  const description = `${companyName} has its revenue independently verified against Stripe. ${mrr} monthly recurring revenue — verified, not a screenshot.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PublicCertificatePage({
  params,
}: {
  params: { certificateId: string };
}) {
  const { certificateId } = params;

  const client = await pool.connect();
  let cert: any;

  try {
    const result = await client.query(
      `SELECT
         c.id, c.mrr, c.arr, c.customers, c.mrr_history,
         c.issued_at, c.verified_at, c.is_active, c.data_status,
         sc.account_name, sc.account_url, sc.account_country, sc.livemode,
         sc.stripe_user_id
       FROM certificates c
       JOIN stripe_connections sc ON sc.user_id = c.user_id
       WHERE c.id = $1 AND c.is_public = true AND c.is_active = true`,
      [certificateId]
    );
    if (result.rows.length === 0) notFound();
    cert = result.rows[0];
  } finally {
    client.release();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proof-revenue.vercel.app';
  const certUrl = `${appUrl}/c/${cert.id}`;
  const shortUrl = certUrl.replace(/^https?:\/\//, '');

  const companyName =
    cert.account_name?.trim() ||
    (cert.account_url ? new URL(cert.account_url).hostname.replace(/^www\./, '') : cert.stripe_user_id);

  const domain = cert.account_url
    ? new URL(cert.account_url).hostname.replace(/^www\./, '')
    : null;

  const mrrHistory: number[] = Array.isArray(cert.mrr_history) ? cert.mrr_history : [];
  const isRevoked = !cert.is_active;
  const verifiedAt = cert.verified_at || cert.issued_at;
  const twitterText = encodeURIComponent(
    `Our revenue is independently verified — check the certificate:`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(certUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;

  return (
    <div className="bg-paper min-h-screen text-ink-900 font-sans">

      {/* Top bar */}
      <div className="border-b border-line px-4 sm:px-8 py-4 flex items-center justify-between bg-white">
        <span className="font-sans font-semibold text-sm tracking-tight text-ink-900">ProofRevenue</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block font-mono text-xs text-ink-400">{shortUrl}</span>
          <CopyLinkButton url={certUrl} />
        </div>
      </div>

      {/* Revocation banner */}
      {isRevoked && (
        <div className="px-4 sm:px-8 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-center gap-2 text-sm text-amber-800">
          <span>⚠</span>
          <span>Revenue data pending re-verification · last verified {fmtDate(verifiedAt)}</span>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-16">

        {/* Company header */}
        <div className="mb-8">
          {/* Verified badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-soft border border-emerald rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            <span className="font-mono text-xs text-emerald-ink">
              Stripe verified · {cert.livemode ? 'LIVEMODE' : 'TESTMODE'}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl leading-tight tracking-tight mb-1">
            {companyName}
          </h1>

          {domain && (
            <p className="font-mono text-sm text-ink-400 mb-4">{domain}</p>
          )}

          <p className="text-sm text-ink-600 leading-relaxed max-w-lg">
            …has its revenue independently verified against Stripe, with figures snapshotted on{' '}
            <span className="text-ink-900 font-medium">{fmtDatetime(verifiedAt)}</span>.
          </p>
        </div>

        {/* MRR hero card */}
        <div className="bg-white border border-line rounded-xl p-6 sm:p-8 mb-4">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">
            Monthly Recurring Revenue
          </div>
          <div className="font-serif text-5xl sm:text-7xl leading-none tracking-tight mb-1">
            {fmt(cert.mrr ?? 0)}
          </div>
          {mrrHistory.length >= 2 && (
            <div className="mt-5 pt-5 border-t border-line">
              <div className="font-mono text-xs text-ink-400 mb-2">12-month trend</div>
              <Sparkline data={mrrHistory} width={280} height={44} color="oklch(0.62 0.14 158)" />
            </div>
          )}
        </div>

        {/* ARR + Customers row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="bg-white border border-line rounded-xl p-5 sm:p-6">
            <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">
              Annual Recurring
            </div>
            <div className="font-serif text-2xl sm:text-4xl leading-tight tracking-tight">
              {fmt(cert.arr ?? 0)}
            </div>
            <div className="font-mono text-xs text-ink-400 mt-2">MRR × 12</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-5 sm:p-6">
            <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-2">
              Active Customers
            </div>
            <div className="font-serif text-2xl sm:text-4xl leading-tight tracking-tight">
              {fmtNum(cert.customers ?? 0)}
            </div>
            <div className="font-mono text-xs text-ink-400 mt-2">With paid subscriptions</div>
          </div>
        </div>

        {/* Live verification strip */}
        <div className="flex items-center gap-2.5 py-3 px-4 bg-white border border-line rounded-xl mb-6 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />
          <span className="font-mono text-xs text-ink-600 truncate">
            Verified {fmtDatetime(verifiedAt)} · refreshed each billing cycle
          </span>
        </div>

        {/* Share row */}
        <div className="flex flex-wrap gap-2 mb-10">
          <CopyLinkButton url={certUrl} />
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

        {/* How verified */}
        <div className="bg-white border border-line rounded-xl p-5 sm:p-6 mb-6">
          <div className="font-mono text-xs text-ink-400 uppercase tracking-widest mb-3">
            How this is verified
          </div>
          <p className="text-sm text-ink-600 leading-relaxed">
            ProofRevenue reads revenue data directly from Stripe using read-only OAuth access to
            a verified Stripe account.
            Figures are snapshotted at connection time. The access token is discarded immediately — we never store it.
            This URL re-renders from the verified database snapshot on every request and cannot be manually edited.
          </p>
          {cert.account_country && (
            <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-4">
              <span className="font-mono text-xs text-ink-400">
                COUNTRY: {cert.account_country.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-ink-400">
                MODE: {cert.livemode ? 'LIVEMODE' : 'TESTMODE'}
              </span>
              <span className="font-mono text-xs text-ink-400">
                CERT ID: {cert.id}
              </span>
            </div>
          )}
        </div>

        {/* CTA for visitors */}
        <div className="border border-line rounded-xl p-5 sm:p-6 bg-white text-center">
          <p className="text-sm text-ink-600 mb-4">
            Want a verified revenue certificate for your own business?
          </p>
          <a
            href={appUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 text-paper text-sm font-medium rounded-lg hover:bg-ink-700 transition-colors"
          >
            Get verified on ProofRevenue →
          </a>
          <p className="font-mono text-xs text-ink-400 mt-3">€9/month · cancel anytime</p>
        </div>

      </div>
    </div>
  );
}
