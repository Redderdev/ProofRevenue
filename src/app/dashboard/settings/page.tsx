'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Common';

export default function DashboardSettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-paper text-ink-900">
      <div className="flex items-center justify-between px-8 py-3.5 border-b border-line">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="font-serif text-5xl letter-spacing-tight mb-3">Settings</h1>
        <p className="text-sm text-ink-600">
          Settings page structure is ready. Next step is wiring real profile, billing and Stripe connection controls.
        </p>
      </div>
    </main>
  );
}
