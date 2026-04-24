'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo, Card } from '@/components/Common';
import { Pill } from '@/components/Badge';

interface PaymentSuccessProps {
  onComplete?: () => void;
  onNav?: (screen: string) => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete, onNav }) => {
  const [phase, setPhase] = useState<'verifying' | 'ready'>('verifying');
  const [dots, setDots] = useState(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => setDots((x) => (x + 1) % 4), 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (phase !== 'verifying') return;
    const timer = setTimeout(() => setPhase('ready'), 4200);
    const retryInterval = setInterval(() => setRetry((x) => x + 1), 1800);
    return () => {
      clearTimeout(timer);
      clearInterval(retryInterval);
    };
  }, [phase]);

  const dotString = '.'.repeat(dots);

  return (
    <div className="bg-paper text-ink-900 min-h-screen font-sans">
      {/* Top nav */}
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
                className="px-2.5 py-1.5 rounded text-xs font-medium text-ink-400 hover:text-ink-900"
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
      <div className="max-w-2xl mx-auto px-8 py-20">
        {/* Status */}
        <div className="text-center mb-10">
          <div
            className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center border ${
              phase === 'ready' ? 'bg-emerald-soft border-emerald' : 'bg-paper-alt border-line'
            }`}
          >
            {phase === 'ready' ? (
              <Icon name="check" size={28} color="oklch(0.62 0.14 158)" strokeWidth={2} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-ink-900 animate-pulse" />
            )}
          </div>

          <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2">
            {phase === 'ready' ? 'CERTIFICATE ACTIVE' : 'PAYMENT · SUCCEEDED'}
          </div>

          <h1 className="font-serif text-4xl letter-spacing-tight">
            {phase === 'ready' ? 'Your certificate is live.' : `Verifying your revenue${dotString}`}
          </h1>

          <p className="text-sm text-ink-600 mt-3.5 max-w-xl mx-auto leading-relaxed">
            {phase === 'ready'
              ? 'We just wrote the first snapshot from Stripe. Your public link is ready to share.'
              : 'Payment confirmed. We&apos;re pulling your first revenue snapshot from Stripe.'}
          </p>
        </div>

        {/* Status card */}
        <Card className="overflow-hidden mb-6">
          <div className="grid grid-cols-4">
            <div className="px-4 py-3.5 border-r border-line">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">
                Certificate
              </div>
              <div className="font-mono text-sm mt-1">cal9x2f4kn</div>
            </div>
            <div className="px-4 py-3.5 border-r border-line">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">
                Issued
              </div>
              <div className="text-sm mt-1">Apr 23, 09:41 UTC</div>
            </div>
            <div className="px-4 py-3.5 border-r border-line">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">
                Retry count
              </div>
              <div className="font-mono text-sm mt-1">{retry}</div>
            </div>
            <div className="px-4 py-3.5">
              <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase">
                Status
              </div>
              <div className="font-mono text-sm mt-1">{phase === 'ready' ? 'ready' : 'pending'}</div>
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="p-5">
            <StepsChecklist phase={phase} retry={retry} />
          </div>
        </Card>

        {/* CTA buttons */}
        <div className="flex justify-center gap-2.5">
          {phase === 'ready' ? (
            <>
              <Button variant="ghost" onClick={onComplete}>
                Go to dashboard
              </Button>
              <Button variant="primary" onClick={() => onNav?.('certificate')}>
                Open your certificate
                <Icon name="arrow-right" size={14} color="white" />
              </Button>
            </>
          ) : (
            <span className="font-mono text-xs text-ink-400 self-center">
              AUTO-REFRESH EVERY 30s · PAGE URL IS STABLE — YOU CAN BOOKMARK IT
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const StepsChecklist: React.FC<{ phase: string; retry: number }> = ({ phase, retry }) => {
  const steps = [
    { key: 'payment_succeeded', text: 'Payment succeeded', done: true },
    { key: 'webhook_received', text: 'Webhook verified', done: true },
    { key: 'cert_created', text: 'Certificate row created', done: true },
    { key: 'snapshot_fetched', text: 'First revenue snapshot', done: phase === 'ready' },
    { key: 'cert_activated', text: 'Certificate activated', done: phase === 'ready' },
  ];

  return (
    <div>
      {steps.map((s) => (
        <div key={s.key} className="flex items-center gap-3 py-2">
          <div
            className={`w-4.5 h-4.5 rounded-full flex-shrink-0 flex items-center justify-center ${
              s.done ? 'bg-emerald' : 'border border-dashed border-line-strong'
            }`}
          >
            {s.done && <Icon name="check" size={10} color="white" strokeWidth={2.4} />}
          </div>
          <div className={`text-xs ${s.done ? 'text-ink-900' : 'text-ink-400'}`}>{s.text}</div>
          <div className="font-mono text-xs text-ink-400 ml-auto">{s.key}</div>
        </div>
      ))}
      {phase !== 'ready' && (
        <div className="mt-2 font-mono text-xs text-ink-400 pl-7">
          polling Stripe… attempt {retry + 1}
        </div>
      )}
    </div>
  );
};
