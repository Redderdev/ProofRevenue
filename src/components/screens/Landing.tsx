'use client';

import React from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Common';
import { useAuth } from '@/lib/AuthContext';

interface LandingProps {
  onStart?: () => void;
  onSignIn?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onSignIn }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="bg-paper text-ink-900 font-sans">
      {/* Top nav */}
      <div className="flex items-center justify-between px-12 py-5 border-b border-line">
        <Logo />
        <div className="flex items-center gap-7">
          <a href="#" className="text-sm text-ink-600 hover:text-ink-900">
            How it works
          </a>
          <a href="#" className="text-sm text-ink-600 hover:text-ink-900">
            Example
          </a>
          <a href="#" className="text-sm text-ink-600 hover:text-ink-900">
            Pricing
          </a>
          <a href="#" className="text-sm text-ink-600 hover:text-ink-900">
            FAQ
          </a>
          
          {/* Auth buttons */}
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-ink-600 font-medium">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignIn}>
                Sign in
              </Button>
              <Button variant="primary" size="sm" onClick={onStart}>
                Get verified
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="px-12 py-20 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-line rounded-full bg-white mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              <span className="font-mono text-xs text-ink-600 letter-spacing-tight">
                VERIFIED · via Stripe · 2,140 founders
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-6xl letter-spacing-tight mt-6 mb-5 leading-tight">
              Prove your revenue.
              <br />
              <span className="italic text-ink-600">Not a screenshot.</span>
            </h1>

            {/* Description */}
            <p className="text-lg leading-relaxed text-ink-600 max-w-lg mb-8">
              Connect Stripe. We pull MRR, ARR and customer count straight from the source,
              then issue a verified public link you can share with investors, buyers and press.
            </p>

            {/* CTA buttons */}
            <div className="flex gap-3 mb-8">
              <Button variant="primary" size="lg" onClick={onStart}>
                Get verified — €14.99
                <Icon name="arrow-right" size={16} color="white" />
              </Button>
              <Button variant="ghost" size="lg">
                See a live certificate
                <Icon name="external" size={14} color="currentColor" />
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-5">
              <span className="font-mono text-xs text-ink-400">ONE-TIME PAYMENT</span>
              <span className="w-px h-3 bg-line" />
              <span className="font-mono text-xs text-ink-400">NO STRIPE TOKENS STORED</span>
              <span className="w-px h-3 bg-line" />
              <span className="font-mono text-xs text-ink-400">LIVE-MODE ONLY</span>
            </div>
          </div>

          {/* Mini certificate preview */}
          <div>
            <MiniCertPreview />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-12 py-20 border-t border-line bg-paper-alt">
        <div className="max-w-screen-2xl mx-auto">
          <div className="font-mono text-xs font-medium letter-spacing-wide text-ink-400 uppercase mb-4">
            How it works
          </div>
          <h2 className="font-serif text-4xl letter-spacing-tight mb-12 max-w-2xl leading-tight">
            Four steps from signup to a shareable link.
          </h2>

          <div className="grid grid-cols-4 gap-6">
            {[
              {
                n: '01',
                t: 'Connect Stripe',
                d: 'OAuth via Stripe Connect. We never see or store your access token.',
              },
              {
                n: '02',
                t: 'Pay €14.99 once',
                d: 'A single Stripe Checkout charge. No subscription, no hidden fees.',
              },
              {
                n: '03',
                t: 'We verify the data',
                d: 'Your MRR, ARR and customer count are pulled directly from Stripe.',
              },
              {
                n: '04',
                t: 'Share your link',
                d: 'A unique public URL at proof.revenue/c/… you can drop anywhere.',
              },
            ].map((s) => (
              <div key={s.n} className="pt-6 border-t border-ink-900">
                <div className="font-mono text-xs text-ink-400 uppercase mb-3">{s.n}</div>
                <div className="font-serif text-xl letter-spacing-tight mb-2">{s.t}</div>
                <div className="text-sm text-ink-600 leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust row */}
      <div className="px-12 py-14 border-t border-line">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-3 gap-8">
          {[
            {
              i: 'shield-check',
              t: 'Server-verified',
              d: 'Every certificate page re-fetches the latest snapshot from Stripe before render.',
            },
            {
              i: 'lock',
              t: 'No tokens stored',
              d: 'We persist only your Stripe account ID, never OAuth access tokens.',
            },
            {
              i: 'bolt',
              t: 'Refreshed daily',
              d: 'A 03:00 UTC cron refreshes every active certificate so data stays current.',
            },
          ].map((b) => (
            <div key={b.i} className="flex gap-3.5">
              <div className="w-8 h-8 rounded border border-line flex items-center justify-center flex-shrink-0">
                <Icon name={b.i as any} size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">{b.t}</div>
                <div className="text-xs text-ink-600 leading-relaxed">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dark CTA section */}
      <div className="px-12 py-20 bg-ink-900 text-paper">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-5xl letter-spacing-tight mb-8 leading-tight">
            Your revenue deserves a
            <br />
            <span className="italic">verified address.</span>
          </h2>
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="bg-paper text-ink-900 hover:bg-gray-100 mx-auto"
          >
            Get verified — €14.99
            <Icon name="arrow-right" size={16} color="#0B1220" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-12 py-7 border-t border-line bg-ink-900 text-ink-300">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo tone="paper" size={14} />
            <span className="font-mono text-xs">© 2026 · Dublin, Ireland</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-xs hover:text-paper">
              TERMS
            </a>
            <a href="#" className="font-mono text-xs hover:text-paper">
              PRIVACY
            </a>
            <a href="#" className="font-mono text-xs hover:text-paper">
              SUPPORT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniCertPreview: React.FC = () => {
  const mockData = {
    name: 'caliAi',
    domain: 'caliai.co',
    certificateId: 'cal9x2f4kn',
    mrr: 48720,
    arr: 584640,
    customers: 1284,
    verifiedAt: 'Apr 23, 2026',
    mrrHistory: [18200, 21900, 24300, 27800, 31200, 34600, 38100, 41900, 44800, 46500, 47200, 48720],
  };

  return (
    <div className="bg-ink-900 text-paper rounded-2xl p-7 relative shadow-2xl border border-ink-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={14} color="oklch(0.62 0.14 158)" />
          <span className="font-mono text-xs letter-spacing-wide text-ink-300 uppercase">
            VERIFIED · APR 2026
          </span>
        </div>
        <span className="font-mono text-xs text-ink-300">{mockData.certificateId}</span>
      </div>

      <div className="flex items-baseline gap-2.5 mb-7">
        <div className="font-serif text-3xl letter-spacing-tight">{mockData.name}</div>
        <span className="font-mono text-xs text-ink-300">{mockData.domain}</span>
      </div>

      <div className="grid grid-cols-2 gap-0 border border-white border-opacity-10 rounded-lg">
        <div className="px-4 py-4 border-r border-b border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300 letter-spacing-normal">MRR</div>
          <div className="font-serif text-3xl letter-spacing-tight mt-1">€{mockData.mrr.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4 border-b border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300 letter-spacing-normal">ARR</div>
          <div className="font-serif text-3xl letter-spacing-tight mt-1">€{mockData.arr.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4 border-r border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300 letter-spacing-normal">CUSTOMERS</div>
          <div className="font-serif text-2xl letter-spacing-tight mt-1">{mockData.customers.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4">
          <div className="font-mono text-xs text-ink-300 letter-spacing-normal">ISSUED</div>
          <div className="font-serif text-2xl letter-spacing-tight mt-1">{mockData.verifiedAt}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-white border-opacity-10">
        <span className="font-mono text-xs text-ink-300">proof.revenue/c/{mockData.certificateId}</span>
        <span className="flex items-center gap-1">
          <Icon name="stripe-s" size={10} color="rgba(255,255,255,0.5)" />
          <span className="font-mono text-xs text-ink-300">via Stripe</span>
        </span>
      </div>
    </div>
  );
};
