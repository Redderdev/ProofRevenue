'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function StripeConnectPage() {
  const router = useRouter();

  const handleStartOAuth = async () => {
    try {
      // Redirect to /api/stripe/authorize which will start the OAuth flow
      // The API endpoint generates a secure state parameter and redirects to Stripe
      window.location.href = '/api/stripe/authorize';
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      router.push('/dashboard?state=stripe_error');
    }
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="font-serif text-3xl letter-spacing-tight text-ink-900 mb-2">
            Connect Stripe
          </h1>
          <p className="text-sm text-ink-600">
            Click below to securely connect your Stripe account with ProofRevenue
          </p>
        </div>

        <button
          onClick={handleStartOAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors w-full"
        >
          Start Stripe Authorization
        </button>

        <p className="text-xs text-ink-400 mt-4">
          You will be redirected to Stripe to authorize access to your account
        </p>
      </div>
    </main>
  );
}
