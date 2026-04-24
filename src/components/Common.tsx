'use client';

import React from 'react';
import clsx from 'clsx';
import { Icon } from './Icon';

export const Logo: React.FC<{ tone?: 'ink' | 'paper'; size?: number }> = ({
  tone = 'ink',
  size = 16,
}) => {
  const color = tone === 'ink' ? 'text-ink-900' : 'text-paper';
  return (
    <div className={clsx('flex items-center gap-2', color)}>
      <Icon name="logo-mark" size={size + 4} color={tone === 'ink' ? '#0B1220' : '#F6F4EE'} />
      <span
        className="font-sans font-semibold letter-spacing-tight"
        style={{ fontSize: size }}
      >
        ProofRevenue
      </span>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('bg-white border border-line rounded-xl', className)}>{children}</div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'w-full px-3 py-2.5 font-sans text-sm bg-white border border-line rounded-lg outline-none transition-colors duration-120',
      'focus:border-ink-700',
      props.className
    )}
  />
);

interface MetricProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'light' | 'dark';
}

export const Metric: React.FC<MetricProps> = ({ label, value, sub, tone = 'light' }) => {
  const isDark = tone === 'dark';
  return (
    <div className={clsx('flex-1 px-5 py-4.5', !isDark && 'border-r border-line')}>
      <div className={clsx('font-mono text-xs font-medium letter-spacing-normal', isDark ? 'text-ink-300' : 'text-ink-400')}>
        {label}
      </div>
      <div
        className={clsx(
          'font-serif text-4xl letter-spacing-tight mt-1.5',
          isDark ? 'text-paper' : 'text-ink-900'
        )}
      >
        {value}
      </div>
      {sub && (
        <div
          className={clsx('font-mono text-xs mt-1.5', isDark ? 'text-ink-300' : 'text-ink-400')}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  height = 36,
  width = 140,
  color = 'oklch(0.62 0.14 158)',
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={(data.length - 1) * step}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};
