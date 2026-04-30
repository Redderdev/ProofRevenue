'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const startCheckout = async () => {
      try {
        const res = await fetch('/api/certificate/checkout', {
          method: 'POST',
          credentials: 'include',
        });

        if (cancelled) return;

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('[Checkout] Error:', body.error);
          router.replace('/dashboard');
          return;
        }

        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          router.replace('/dashboard');
        }
      } catch {
        if (!cancelled) router.replace('/dashboard');
      }
    };

    startCheckout();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <span className="font-mono text-xs text-ink-400">Preparing checkout…</span>
    </main>
  );
}
