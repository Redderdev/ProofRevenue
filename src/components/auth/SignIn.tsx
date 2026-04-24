'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import clsx from 'clsx';

interface SignInProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export function SignIn({ onSuccess, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      if (!password) {
        setError('Password is required');
        return;
      }

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign in');
        return;
      }

      setSuccess(true);
      setEmail('');
      setPassword('');

      // Show success message then callback
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-paper rounded-lg border border-line p-8">
        <h2 className="text-2xl font-serif font-bold text-ink-900 mb-2">Sign In</h2>
        <p className="text-ink-400 text-sm mb-6">Welcome back to ProofRevenue</p>

        {success ? (
          <div className="p-4 bg-emerald-soft border border-emerald rounded-lg text-center">
            <p className="text-emerald-ink font-medium">Signed in successfully!</p>
            <p className="text-emerald-ink text-sm mt-1">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-ruby-soft border border-ruby rounded-lg">
                <p className="text-ruby text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={clsx(
                  'w-full px-4 py-2 rounded-lg border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent',
                  error && !email ? 'border-ruby bg-ruby-soft' : 'border-line bg-white'
                )}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={clsx(
                  'w-full px-4 py-2 rounded-lg border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent',
                  error && !password ? 'border-ruby bg-ruby-soft' : 'border-line bg-white'
                )}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => {}} // Form submission is handled by onSubmit
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-ink-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-emerald font-medium hover:underline disabled:opacity-50"
              disabled={loading}
            >
              Create account
            </button>
          </p>
        </div>

        {/* Forgot Password (Future) */}
        <div className="mt-4 text-center border-t border-line pt-4">
          <button
            disabled
            className="text-ink-400 text-xs hover:text-ink-600 disabled:opacity-50 cursor-not-allowed"
          >
            Forgot password? (Coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
