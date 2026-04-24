'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Checkout } from '@/components/screens/Checkout';

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <Checkout
      onComplete={() => router.push('/dashboard?state=data_pending')}
      onCancel={() => router.push('/dashboard?state=stripe_connected')}
    />
  );
}
