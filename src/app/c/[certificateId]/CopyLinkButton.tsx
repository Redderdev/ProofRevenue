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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-line bg-white hover:bg-paper-alt transition-colors text-ink-700"
    >
      {copied ? '✓ Copied' : '⎘ Copy link'}
    </button>
  );
}
