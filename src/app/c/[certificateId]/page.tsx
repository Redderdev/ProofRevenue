import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { Sparkline } from '@/components/Common';
import CopyLinkButton from './CopyLinkButton';

export const dynamic = 'force-dynamic';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDatetime(d: Date | string | null): string {
  if (!d) return '—';
  return (
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' · ' +
    new Date(d).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) +
    ' UTC'
  );
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
         c.id, c.mrr, c.arr, c.customers, c.total_revenue, c.mrr_history,
         c.issued_at, c.verified_at, c.is_active, c.data_status,
         sc.account_name, sc.account_url, sc.account_country, sc.livemode,
         sc.stripe_user_id
       FROM certificates c
       JOIN stripe_connections sc ON sc.user_id = c.user_id
       WHERE c.id = $1 AND c.is_public = true`,
      [certificateId]
    );

    if (result.rows.length === 0) notFound();
    cert = result.rows[0];
  } finally {
    client.release();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proof-revenue.vercel.app';
  const certUrl = `${appUrl}/c/${cert.id}`;

  const companyName =
    cert.account_name?.trim() ||
    (cert.account_url
      ? new URL(cert.account_url).hostname.replace(/^www\./, '')
      : cert.stripe_user_id);

  const domain = cert.account_url
    ? new URL(cert.account_url).hostname.replace(/^www\./, '')
    : null;

  const mrrHistory: number[] = Array.isArray(cert.mrr_history) ? cert.mrr_history : [];
  const isRevoked = !cert.is_active;
  const shortAccountId =
    cert.stripe_user_id.length > 12
      ? `${cert.stripe_user_id.slice(0, 8)}···${cert.stripe_user_id.slice(-4)}`
      : cert.stripe_user_id;

  return (
    <div
      style={{
        background: '#0B1220',
        minHeight: '100vh',
        color: '#F6F4EE',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#F6F4EE' }}>
          ProofRevenue
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.04em' }}
          >
            {certUrl.replace(/^https?:\/\//, '')}
          </span>
          <CopyLinkButton url={certUrl} />
        </div>
      </div>

      {/* Revocation banner */}
      {isRevoked && (
        <div
          style={{
            background: 'oklch(0.32 0.09 75)',
            borderBottom: '1px solid oklch(0.45 0.12 75)',
            padding: '10px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
            fontSize: 13,
            color: 'oklch(0.95 0.06 85)',
          }}
        >
          ⚠ Revenue data pending re-verification · last verified {formatDate(cert.verified_at)}
        </div>
      )}

      {/* Certificate card */}
      <div style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760, position: 'relative' }}>
          {/* Verified seal */}
          <div
            style={{
              position: 'absolute',
              top: -28,
              right: -8,
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: '#F6F4EE',
              color: '#0B1220',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
              transform: 'rotate(8deg)',
              border: '1px solid rgba(11,18,32,0.1)',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>✓</span>
            <span style={{ fontFamily: 'monospace', fontSize: 8, marginTop: 2, letterSpacing: '0.14em', fontWeight: 700 }}>
              VERIFIED
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em', color: 'rgba(11,18,32,0.5)' }}>
              {new Date(cert.verified_at || cert.issued_at)
                .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                .toUpperCase()}
            </span>
          </div>

          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 60px 120px -40px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '36px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.16em' }}>
                  REVENUE CERTIFICATE · {cert.id.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.1em' }}>
                  VIA STRIPE · {cert.livemode ? 'LIVEMODE' : 'TESTMODE'}
                </span>
              </div>

              <div style={{ marginTop: 32, display: 'flex', alignItems: 'flex-end', gap: 18 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.12em', marginBottom: 8 }}>
                    THIS CERTIFIES THAT
                  </div>
                  <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1, color: '#F6F4EE' }}>
                    {companyName}
                  </div>
                </div>
                {domain && (
                  <div style={{ paddingBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(246,244,238,0.4)' }}>
                      {domain}
                    </span>
                  </div>
                )}
              </div>

              <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.5, color: 'rgba(246,244,238,0.6)', maxWidth: 560 }}>
                …has its revenue independently verified against Stripe, with figures snapshotted on{' '}
                <span style={{ color: '#F6F4EE' }}>{formatDatetime(cert.verified_at || cert.issued_at)}</span>.
              </p>
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '28px 40px', borderRight: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.14em' }}>
                  MRR · MONTHLY RECURRING
                </div>
                <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 52, letterSpacing: '-0.03em', marginTop: 8, lineHeight: 1, color: '#F6F4EE' }}>
                  {formatCurrency(cert.mrr ?? 0)}
                </div>
                {mrrHistory.length >= 2 && (
                  <div style={{ marginTop: 12 }}>
                    <Sparkline data={mrrHistory} width={200} height={36} color="oklch(0.62 0.14 158)" />
                  </div>
                )}
              </div>

              <div style={{ padding: '28px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.14em' }}>
                  ARR · ANNUAL RECURRING
                </div>
                <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 52, letterSpacing: '-0.03em', marginTop: 8, lineHeight: 1, color: '#F6F4EE' }}>
                  {formatCurrency(cert.arr ?? 0)}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(246,244,238,0.4)', marginTop: 16, letterSpacing: '0.06em' }}>
                  MRR × 12
                </div>
              </div>

              <div style={{ padding: '22px 40px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.14em' }}>
                  ACTIVE CUSTOMERS
                </div>
                <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 34, letterSpacing: '-0.02em', marginTop: 6, color: '#F6F4EE' }}>
                  {formatNum(cert.customers ?? 0)}
                </div>
              </div>

              <div style={{ padding: '22px 40px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.4)', letterSpacing: '0.14em' }}>
                  CERTIFICATE ISSUED
                </div>
                <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 34, letterSpacing: '-0.02em', marginTop: 6, color: '#F6F4EE' }}>
                  {formatDate(cert.issued_at)}
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div
              style={{
                padding: '16px 40px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.02em', color: '#F6F4EE' }}>
                  ProofRevenue
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.3)', letterSpacing: '0.08em' }}>
                  {certUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.3)', letterSpacing: '0.08em' }}>
                  {cert.account_country ? `COUNTRY: ${cert.account_country.toUpperCase()} · ` : ''}LIVEMODE: {cert.livemode ? 'TRUE' : 'FALSE'}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(246,244,238,0.3)', letterSpacing: '0.08em' }}>
                  FETCHED {formatDatetime(cert.verified_at || cert.issued_at).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Share row */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <CopyLinkButton url={certUrl} />
            <a
              href={`https://twitter.com/intent/tweet?text=Our%20revenue%20is%20independently%20verified%20%E2%80%94%20check%20the%20certificate%3A&url=${encodeURIComponent(certUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#F6F4EE', textDecoration: 'none' }}
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#F6F4EE', textDecoration: 'none' }}
            >
              Share on LinkedIn
            </a>
          </div>

          {/* Verification explanation */}
          <div style={{ marginTop: 48, padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(246,244,238,0.4)', marginBottom: 10 }}>
              HOW THIS IS VERIFIED
            </div>
            <p style={{ fontSize: 13, color: 'rgba(246,244,238,0.6)', lineHeight: 1.6, margin: 0 }}>
              ProofRevenue reads revenue data directly from Stripe using read-only OAuth access to account{' '}
              <span style={{ fontFamily: 'monospace', color: '#F6F4EE' }}>{shortAccountId}</span>.
              The figures above are a snapshot taken at the time of purchase and refreshed daily.
              This URL is stable and re-renders from live database state on every request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
