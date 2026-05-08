'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CertificatePage } from '@/components/screens/Certificate';

export default function DashboardCertificatePage() {
  const router = useRouter();

  const handleNav = (screen: string) => {
    if (screen === 'settings') { router.push('/dashboard/settings'); return; }
    if (screen === 'certificate') { return; } // already here
    router.push('/dashboard');
  };

  return <CertificatePage onNav={handleNav} />;
}
