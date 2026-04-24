'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo, Sparkline } from '@/components/Common';
import { Pill } from '@/components/Badge';
import { eur, num } from '@/lib/utils';

interface CertificatePageProps {
  revoked?: boolean;
  onNav?: (screen: string) => void;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({ revoked = false, onNav }) => {
  const [copied, setCopied] = useState(false);

  const mockData = {
    name: 'caliAi',
    domain: 'caliai.co',
    certificateId: 'cal9x2f4kn',
    mrr: 48720,
    arr: 584640,
    customers: 1284,
    issuedAt: 'Apr 23, 2026',
    verifiedAt: '2026-04-23 09:41 UTC',
    country: 'IE',
    livemode: true,
    mrrHistory: [18200, 21900, 24300, 27800, 31200, 34600, 38100, 41900, 44800, 46500, 47200, 48720],
  };

  const certUrl = `https://proof.revenue/c/${mockData.certificateId}`;

  const copy = () => {
    navigator.clipboard?.writeText(certUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-ink-950 text-paper min-h-screen font-sans">
      {/* Top bar */}
      <div className="px-8 py-4 flex justify-between items-center border-b border-white border-opacity-10">
        <Logo tone="paper" size={14} />
        <div className="flex items-center gap-3.5">
          <span className="font-mono text-xs text-ink-300">
            proof.revenue/c/{mockData.certificateId}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-white hover:bg-opacity-20"
            onClick={copy}
          >
            {copied ? (
              <>
                <Icon name="check" size={12} color="white" />
                Copied
              </>
            ) : (
              <>
                <Icon name="link" size={12} color="white" />
                Copy link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Revocation banner */}
      {revoked && (
        <div className="px-8 py-2.5 bg-amber-900 border-b border-amber-800 flex items-center gap-2.5 justify-center">
          <Icon name="warn" size={14} color="oklch(0.92 0.10 85)" />
          <span className="text-sm text-amber-100">
            Revenue data pending re-verification · last verified Apr 22, 2026
          </span>
        </div>
      )}

      {/* Certificate card */}
      <div className="px-6 py-15 flex justify-center">
        <div className="w-full max-w-2xl relative">
          {/* Seal badge */}
          <div className="absolute -top-7 -right-7 w-27 h-27 rounded-full bg-paper text-ink-900 flex flex-col items-center justify-center shadow-2xl border border-line transform rotate-2">
            <Icon name="shield-check" size={22} color="oklch(0.62 0.14 158)" />
            <div className="font-mono text-xs mt-1 letter-spacing-wide">VERIFIED</div>
            <div className="font-mono text-xs letter-spacing-wide text-ink-400">APR 2026</div>
          </div>

          {/* Main card */}
          <div className="bg-blue-950 border border-white border-opacity-10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-10 py-9 border-b border-white border-opacity-10">
              <div className="flex items-center justify-between mb-8">
                <div className="font-mono text-xs letter-spacing-wide text-ink-300 uppercase">
                  REVENUE CERTIFICATE · ID {mockData.certificateId.toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="stripe-s" size={12} color="rgba(255,255,255,0.5)" />
                  <span className="font-mono text-xs letter-spacing-wide text-ink-300">
                    VIA STRIPE · LIVEMODE
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-4.5">
                <div>
                  <div className="font-mono text-xs letter-spacing-wide text-ink-300 mb-2">This certifies that</div>
                  <div className="font-serif text-7xl letter-spacing-tight text-paper leading-none">
                    {mockData.name}
                  </div>
                </div>
                <div className="pb-1.5">
                  <span className="font-mono text-sm text-ink-300">{mockData.domain}</span>
                </div>
              </div>

              <div className="mt-4.5 text-base leading-relaxed text-ink-200 max-w-xl">
                …has its revenue independently verified against Stripe, with the following figures
                snapshotted on <span className="text-paper">{mockData.verifiedAt}</span>.
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2">
              <div className="px-10 py-7 border-r border-b border-white border-opacity-10">
                <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-300 uppercase mb-2">
                  MRR · MONTHLY RECURRING
                </div>
                <div className="font-serif text-5xl letter-spacing-tight text-paper leading-none mb-2.5">
                  {eur(mockData.mrr)}
                </div>
                <div className="mt-2.5">
                  <Sparkline
                    data={mockData.mrrHistory}
                    width={200}
                    height={36}
                    color="oklch(0.62 0.14 158)"
                  />
                </div>
              </div>

              <div className="px-10 py-7 border-b border-white border-opacity-10">
                <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-300 uppercase mb-2">
                  ARR · ANNUAL RECURRING
                </div>
                <div className="font-serif text-5xl letter-spacing-tight text-paper leading-none mb-2.5">
                  {eur(mockData.arr)}
                </div>
                <div className="font-mono text-xs text-ink-300 mt-4 letter-spacing-normal">MRR × 12</div>
              </div>

              <div className="px-10 py-5.5 border-r border-white border-opacity-10">
                <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-300 uppercase mb-1.5">
                  ACTIVE CUSTOMERS
                </div>
                <div className="font-serif text-3xl letter-spacing-tight text-paper">
                  {num(mockData.customers)}
                </div>
              </div>

              <div className="px-10 py-5.5">
                <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-300 uppercase mb-1.5">
                  CERTIFICATE ISSUED
                </div>
                <div className="font-serif text-3xl letter-spacing-tight text-paper">
                  {mockData.issuedAt}
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="px-10 py-4 border-t border-white border-opacity-10 flex items-center justify-between bg-white bg-opacity-5">
              <div className="flex items-center gap-4">
                <Logo tone="paper" size={12} />
                <span className="font-mono text-xs letter-spacing-wide text-ink-300">
                  proof.revenue/c/{mockData.certificateId}
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="font-mono text-xs letter-spacing-wide text-ink-300">
                  COUNTRY: {mockData.country} · LIVEMODE: {mockData.livemode ? 'TRUE' : 'FALSE'}
                </span>
                <span className="font-mono text-xs letter-spacing-wide text-ink-300">
                  FETCHED {mockData.verifiedAt.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-6 flex gap-2.5 justify-center">
            <Button variant="ghost" size="sm" className="bg-white bg-opacity-10 hover:bg-opacity-20">
              <Icon name="copy" size={12} color="white" />
              Embed badge
            </Button>
            <Button variant="ghost" size="sm" className="bg-white bg-opacity-10 hover:bg-opacity-20">
              Share on X
            </Button>
            <Button variant="ghost" size="sm" className="bg-white bg-opacity-10 hover:bg-opacity-20">
              Share on LinkedIn
            </Button>
          </div>

          {/* Explanation strip */}
          <div className="mt-12 p-6 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl">
            <div className="font-mono text-xs letter-spacing-wide text-ink-300 uppercase mb-2.5">
              How this is verified
            </div>
            <div className="text-sm text-ink-200 leading-relaxed">
              ProofRevenue reads revenue data directly from Stripe using read-only access to account
              <span className="font-mono text-paper"> acct_1QrXz4···kpLm</span>. The figures above are
              the most recent snapshot written by the daily cron at 03:00 UTC. The url on this page is
              stable and re-renders from live database state on every request.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
