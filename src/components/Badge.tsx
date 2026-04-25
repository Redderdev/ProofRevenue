import React from 'react';
import clsx from 'clsx';

interface PillProps {
  tone?: 'neutral' | 'emerald' | 'amber' | 'ruby' | 'dark';
  pulse?: boolean;
  children: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({ tone = 'neutral', pulse = false, children }) => {
  const toneStyles = {
    neutral: 'bg-ink-100 text-ink-600',
    emerald: 'bg-emerald-soft text-emerald-ink',
    amber: 'bg-amber-soft text-amber-600',
    ruby: 'bg-ruby-soft text-red-700',
    dark: 'bg-ink-900 text-paper',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2 py-0.5 rounded-full letter-spacing-tight',
        toneStyles[tone]
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', pulse && 'animate-pulse')}
        style={{ background: 'currentColor' }}
      />
      {children}
    </span>
  );
};

interface StateBadgeProps {
  state: string;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state }) => {
  const map: Record<
    string,
    { tone: PillProps['tone']; label: string; pulse?: boolean }
  > = {
    unconnected: { tone: 'neutral', label: 'Unconnected' },
    stripe_connected: { tone: 'emerald', label: 'Stripe connected' },
    stripe_revoked_before_payment: { tone: 'ruby', label: 'Connection revoked' },
    payment_pending: { tone: 'amber', label: 'Payment processing', pulse: true },
    data_pending: { tone: 'amber', label: 'Data pending', pulse: true },
    certificate_active: { tone: 'emerald', label: 'Verified' },
    stripe_revoked_after_payment: { tone: 'amber', label: 'Re-verification needed' },
  };

  const s = map[state] ?? map.unconnected;
  return (
    <Pill tone={s.tone} pulse={s.pulse}>
      {s.label}
    </Pill>
  );
};
