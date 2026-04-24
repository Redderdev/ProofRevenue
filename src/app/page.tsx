'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Landing } from '@/components/screens/Landing';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      router.push('/connect/stripe');
      return;
    }
    router.push('/auth/signin?next=/connect/stripe');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <main className="w-full">
      <Landing onStart={handleStart} onSignIn={handleSignIn} />
    </main>
  );
}
