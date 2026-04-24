'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

interface CheckoutProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete?.();
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex">
      {/* Left side - Order summary */}
      <div className="flex-1 px-15 py-12 max-w-lg">
        <div className="flex items-center gap-2.5 mb-12">
          <a onClick={onCancel} className="cursor-pointer text-sm text-ink-400 hover:text-ink-900 flex items-center gap-1.5">
            <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }} />
            ProofRevenue
          </a>
        </div>

        <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2">
          ProofRevenue · One-time
        </div>
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <div className="font-serif text-5xl letter-spacing-tight">€14.99</div>
          <span className="font-mono text-xs text-ink-400">EUR</span>
        </div>
        <div className="text-sm text-ink-600 mb-8">Verified revenue certificate · 1 × caliAi</div>

        <div className="py-3.5 border-t border-b border-line text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-ink-600">Subtotal</span>
            <span className="font-mono">€14.99</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-ink-600">VAT</span>
            <span className="font-mono">—</span>
          </div>
        </div>
        <div className="py-3.5 text-sm font-semibold">
          <div className="flex justify-between">
            <span>Total due today</span>
            <span className="font-mono">€14.99</span>
          </div>
        </div>
      </div>

      {/* Right side - Payment form */}
      <div className="flex-1 bg-white px-15 py-12 border-l border-line max-w-lg">
        <div className="text-sm text-ink-400 mb-5">Pay with card</div>

        <label className="text-xs text-ink-600 block mb-1">Email</label>
        <input
          className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-4"
          defaultValue="founder@caliai.co"
        />

        <label className="text-xs text-ink-600 block mb-1 mt-4">Card information</label>
        <input
          className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-2"
          defaultValue="4242 4242 4242 4242"
        />
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <input
            className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700"
            defaultValue="12 / 28"
          />
          <input
            className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700"
            defaultValue="424"
          />
        </div>

        <label className="text-xs text-ink-600 block mb-1 mt-4">Cardholder name</label>
        <input
          className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-4"
          defaultValue="Cali Ó Briain"
        />

        <label className="text-xs text-ink-600 block mb-1 mt-4">Country</label>
        <input
          className="w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none focus:border-ink-700 mb-7"
          defaultValue="Ireland"
        />

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          {loading ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Processing…
            </>
          ) : (
            <>Pay €14.99</>
          )}
        </Button>

        <div className="text-center mt-4">
          <span className="font-mono text-xs text-ink-400">POWERED BY STRIPE · MOCK</span>
        </div>
      </div>
    </div>
  );
};
