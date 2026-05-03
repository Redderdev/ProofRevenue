'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import clsx from 'clsx';

interface SignUpProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUp({ onSuccess, onSwitchToLogin }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrengthErrors, setPasswordStrengthErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Password strength validation feedback
  const checkPasswordStrength = (pwd: string) => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('At least 1 uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('At least 1 lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('At least 1 number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('At least 1 special character');
    }

    setPasswordStrengthErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

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

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Check password strength
      if (!checkPasswordStrength(password)) {
        setError('Password does not meet security requirements');
        return;
      }

      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-paper rounded-lg border border-line p-8">
        <h2 className="text-2xl font-serif font-bold text-ink-900 mb-2">Create Account</h2>
        <p className="text-ink-400 text-sm mb-6">Join ProofRevenue and verify your revenue</p>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-soft border border-emerald rounded-lg text-center">
              <p className="text-emerald-ink font-medium text-lg">Check your inbox</p>
              <p className="text-emerald-ink text-sm mt-2">
                We sent a confirmation link to <strong>{email}</strong>.
                Click it to activate your account.
              </p>
              <p className="text-emerald-ink text-xs mt-2 opacity-70">
                Don&apos;t see it? Check your spam folder.
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="w-full text-sm text-ink-600 hover:text-ink-900 underline"
            >
              Already confirmed? Sign in
            </button>
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
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-line bg-white focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors disabled:opacity-50"
                disabled={loading}
              />
              {password && passwordStrengthErrors.length > 0 && (
                <div className="mt-2 p-3 bg-amber-soft border border-amber rounded-lg">
                  <p className="text-amber text-xs font-medium mb-1">Password requirements:</p>
                  <ul className="text-amber text-xs space-y-1">
                    {passwordStrengthErrors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={clsx(
                  'w-full px-4 py-2 rounded-lg border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent',
                  password && confirmPassword && password !== confirmPassword
                    ? 'border-ruby bg-ruby-soft'
                    : 'border-line bg-white'
                )}
                disabled={loading}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-ruby text-xs">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => {}} // Form submission is handled by onSubmit
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-ink-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald font-medium hover:underline disabled:opacity-50"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
