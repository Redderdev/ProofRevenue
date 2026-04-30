'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn } from '@/components/auth/SignIn';
import { useAuth } from '@/lib/AuthContext';

export const dynamic = 'force-dynamic';

function sanitizeNextPath(path: string | null): string {
  // Reject null, empty, non-relative, or protocol-relative URLs (//evil.com)
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/dashboard';
  }

  if (path.startsWith('/auth/signin') || path.startsWith('/auth/signup')) {
    return '/dashboard';
  }

  return path;
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const nextPath = sanitizeNextPath(searchParams.get('next'));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  if (isLoading) {
    return <main className="min-h-screen bg-paper" />;
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center p-6">
      <SignIn
        onSuccess={() => router.push(nextPath)}
        onSwitchToSignUp={() =>
          router.push(`/auth/signup?next=${encodeURIComponent(nextPath)}`)
        }
      />
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" />}>
      <SignInPageContent />
    </Suspense>
  );
}
