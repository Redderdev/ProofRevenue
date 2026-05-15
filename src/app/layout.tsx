import type { Metadata } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://proof-revenue.vercel.app'),
  title: {
    default: 'ProofRevenue — Verified Revenue Certificate',
    template: '%s | ProofRevenue',
  },
  description:
    'Prove your revenue with a verified certificate. Connect Stripe, pay once, get a shareable link investors and buyers can trust. No screenshots, no fake numbers.',
  keywords: [
    'revenue verification',
    'Stripe certificate',
    'proof of revenue',
    'MRR verification',
    'SaaS revenue proof',
    'investor due diligence',
  ],
  openGraph: {
    title: 'ProofRevenue — Verified Revenue Certificate',
    description:
      'Connect Stripe. Get verified MRR, ARR and customer count in one shareable link investors and buyers can trust.',
    type: 'website',
    url: 'https://proof-revenue.vercel.app',
    siteName: 'ProofRevenue',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofRevenue — Verified Revenue Certificate',
    description:
      'Connect Stripe. Get verified MRR, ARR and customer count in one shareable link investors and buyers can trust.',
  },
  alternates: {
    canonical: 'https://proof-revenue.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-paper text-ink-900 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
