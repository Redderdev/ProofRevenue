'use client';

import React, { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 11,
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: '0.06em',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 6,
        color: '#F6F4EE',
        cursor: 'pointer',
      }}
    >
      {copied ? '✓ Copied' : '⎘ Copy link'}
    </button>
  );
}
