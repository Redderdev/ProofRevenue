'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CertificatePage } from '@/components/screens/Certificate';

export default function DashboardCertificatePage() {
  const router = useRouter();

  return <CertificatePage onNav={() => router.push('/dashboard')} />;
}
