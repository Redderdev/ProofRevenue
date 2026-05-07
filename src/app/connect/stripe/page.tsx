'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StripeConnectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartOAuth = async () => {
    setLoading(true);
    try {
      window.location.href = '/api/stripe/authorize';
    } catch {
      router.push('/dashboard?state=stripe_error');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-3xl tracking-tight text-ink-900 mb-2">
            Connect your Stripe account
          </h1>
          <p className="text-sm text-ink-600">
             ProofRevenue only reads your subscription data we never create charges, modify customers, or touch your payouts. You can verify this and revoke access at any time.
          </p>
        </div>

        {/* What we access */}
        <div className="border border-line rounded-xl p-5 bg-white space-y-4">
          <p className="text-xs font-mono tracking-widest text-ink-400 uppercase">What we access</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <div>
                <p className="text-sm font-medium text-ink-900">Active subscriptions</p>
                <p className="text-xs text-ink-400">Count and amounts to calculate MRR/ARR</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <div>
                <p className="text-sm font-medium text-ink-900">Active customer count</p>
                <p className="text-xs text-ink-400">Number of customers with active subscriptions</p>
              </div>
            </div>
          </div>
          <div className="border-t border-line pt-4 space-y-2">
            <p className="text-xs font-mono tracking-widest text-ink-400 uppercase">We never access</p>
            {[
              'Card numbers or bank account details',
              'Customer names, emails, or personal data',
              'Payout schedules or balance information',
              'Individual charge or invoice details',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-red-400">✗</span>
                <p className="text-sm text-ink-600">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-400 pt-2 border-t border-line">
            Access is <strong>read-only</strong>. We can never create charges, issue refunds,
            or change anything in your account. Revoke access anytime from your Stripe dashboard
            or from Settings&nbsp;page.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={handleStartOAuth}
            disabled={loading}
            className="w-full bg-[#635bff] hover:bg-[#4f46e5] disabled:opacity-60 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Redirecting to Stripe…' : 'Connect with Stripe'}
          </button>
          <p className="text-center text-xs text-ink-400">
            You will be taken to Stripe&apos;s secure authorization page.
            ProofRevenue never sees your Stripe login credentials.
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
