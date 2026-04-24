'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Badge';

interface StripeOAuthProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const StripeOAuth: React.FC<StripeOAuthProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="bg-blue-600 min-h-screen text-white font-sans flex flex-col">
      {/* Header */}
      <div className="px-10 py-5 flex justify-between items-center border-b border-white border-opacity-15">
        <div className="flex items-center gap-3.5">
          <Icon name="stripe-s" size={22} color="white" />
          <span className="text-sm font-medium">Connect</span>
          <span className="text-xs opacity-60">· Connecting to ProofRevenue</span>
        </div>
        <span className="font-mono text-xs opacity-70">MOCK · DEMO</span>
      </div>

      {/* Modal */}
      <div className="flex-1 flex justify-center items-start p-6 pt-15">
        <div className="w-full max-w-md bg-white text-ink-900 rounded-xl overflow-hidden shadow-2xl">
          {/* Modal header */}
          <div className="px-6 py-4.5 border-b border-line flex items-center gap-2.5">
            <Icon name="logo-mark" size={18} color="#0B1220" />
            <div className="text-sm font-medium">ProofRevenue is requesting access</div>
          </div>

          {/* Step 0: Login */}
          {step === 0 && (
            <div className="p-7">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2.5">
                Sign in to continue
              </div>
              <h3 className="text-xl font-medium mb-5">Sign in to your Stripe account</h3>

              <label className="text-xs text-ink-600 block mb-1">Email</label>
              <input
                className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-3.5"
                defaultValue="founder@caliai.co"
              />

              <label className="text-xs text-ink-600 block mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-5"
                defaultValue="••••••••••••"
              />

              <Button
                variant="primary"
                className="w-full justify-center bg-blue-600 hover:bg-blue-700"
                onClick={() => setStep(1)}
              >
                Continue
                <Icon name="arrow-right" size={14} color="white" />
              </Button>

              <div className="text-center mt-3.5 text-xs text-ink-400">
                <a onClick={onCancel} className="cursor-pointer hover:text-ink-900">
                  Cancel and return to ProofRevenue
                </a>
              </div>
            </div>
          )}

          {/* Step 1: Select account */}
          {step === 1 && (
            <div className="p-7">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2.5">
                Select account
              </div>
              <h3 className="text-xl font-medium mb-1.5">Choose a Stripe account</h3>
              <p className="text-sm text-ink-600 mb-4.5">
                You&apos;ll grant read-only access to revenue data for the account you pick.
              </p>

              {[
                { name: 'caliAi', id: 'acct_1QrXz4NmFrAkpLm', country: 'Ireland', live: true },
                {
                  name: 'caliAi (sandbox)',
                  id: 'acct_1TestRfuoJfak22',
                  country: 'Ireland',
                  live: false,
                },
              ].map((account) => (
                <button
                  key={account.id}
                  onClick={() => account.live && setStep(2)}
                  disabled={!account.live}
                  className="w-full text-left p-3.5 rounded-lg border border-line bg-white mb-2.5 cursor-pointer hover:bg-paper-alt disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-ink-900 text-paper text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    cA
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{account.name}</div>
                    <div className="font-mono text-xs text-ink-400">
                      {account.id.slice(0, 18)}··· · {account.country}
                    </div>
                  </div>
                  {account.live ? (
                    <Pill tone="emerald">Livemode</Pill>
                  ) : (
                    <Pill tone="neutral">Test</Pill>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Review scopes */}
          {step === 2 && (
            <div className="p-7">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2.5">
                Review scopes
              </div>
              <h3 className="text-xl font-medium mb-3.5">ProofRevenue will be able to:</h3>

              {[
                ['Read subscription MRR and ARR', 'check'],
                ['Read active customer count', 'check'],
                ['Read livemode flag and country', 'check'],
              ].map(([text, icon]) => (
                <div key={text} className="flex items-center gap-2.5 py-2 text-sm">
                  <Icon name={icon as any} size={14} color="oklch(0.62 0.14 158)" />
                  {text}
                </div>
              ))}

              <div className="mt-3.5 p-3 bg-paper-alt rounded text-xs text-ink-600">
                ProofRevenue <strong>cannot</strong> create charges, issue refunds, read customer
                PII, or move funds.
              </div>

              <div className="mt-5 flex gap-2.5 justify-center items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-ink-900 animate-pulse" />
                <span className="font-mono text-xs text-ink-400">Authorising…</span>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-soft mx-auto mb-4.5 flex items-center justify-center">
                <Icon name="check" size={28} color="oklch(0.62 0.14 158)" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-medium mb-2">Connected</h3>
              <p className="text-sm text-ink-600 mb-5">Redirecting you back to ProofRevenue…</p>
              <Button variant="primary" onClick={onComplete}>
                Continue to ProofRevenue
                <Icon name="arrow-right" size={14} color="white" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
