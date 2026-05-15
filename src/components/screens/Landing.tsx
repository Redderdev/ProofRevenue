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
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="bg-paper text-ink-900 font-sans">
      {/* Top nav */}
      <div className="flex items-center justify-between px-4 md:px-12 py-5 border-b border-line">
        <Logo />
        <div className="flex items-center gap-4 md:gap-7">
          <nav className="hidden md:flex items-center gap-7">
            <a href="#how-it-works" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">How it works</a>
            <a href="#example" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">Example</a>
            <a href="#pricing" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">FAQ</a>
          </nav>

          {isAuthenticated && user ? (
            <>
              <span className="hidden sm:block text-sm text-ink-600 font-medium">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignIn}>Sign in</Button>
              <Button variant="primary" size="sm" onClick={onStart}>Get verified</Button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 md:px-12 py-12 md:py-20 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-line rounded-full bg-white mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              <span className="font-mono text-xs text-ink-600">
                STRIPE VERIFIED · LIVE MODE ONLY
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight mt-6 mb-5 leading-tight">
              Prove your revenue.
              <br />
              <span className="italic text-ink-600">Not a screenshot.</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg leading-relaxed text-ink-600 max-w-lg mb-8">
              Connect Stripe. We pull MRR, ARR and customer count straight from the source,
              then issue a verified public link you can share with investors, buyers and press.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button variant="primary" size="lg" onClick={onStart}>
                Get verified — €9/mo
                <Icon name="arrow-right" size={16} color="white" />
              </Button>
              <a href="#example">
                <Button variant="ghost" size="lg">
                  See a live certificate
                  <Icon name="external" size={14} color="currentColor" />
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-xs text-ink-400">€9/MONTH</span>
              <span className="hidden sm:block w-px h-3 bg-line" />
              <span className="font-mono text-xs text-ink-400">CANCEL ANYTIME</span>
              <span className="hidden sm:block w-px h-3 bg-line" />
              <span className="font-mono text-xs text-ink-400">NO TOKENS STORED</span>
              <span className="hidden sm:block w-px h-3 bg-line" />
              <span className="font-mono text-xs text-ink-400">LIVE MODE ONLY</span>
            </div>
          </div>

          {/* Mini certificate preview */}
          <div className="hidden lg:block">
            <MiniCertPreview />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="px-4 md:px-12 py-12 md:py-20 border-t border-line bg-paper-alt">
        <div className="max-w-screen-2xl mx-auto">
          <div className="font-mono text-xs font-medium tracking-widest text-ink-400 uppercase mb-4">
            How it works
          </div>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight mb-10 md:mb-12 max-w-2xl leading-tight">
            Four steps from signup to a shareable link.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: '01',
                t: 'Connect Stripe',
                d: 'OAuth via Stripe Connect. We never see or store your access token.',
              },
              {
                n: '02',
                t: 'Subscribe — €9/mo',
                d: 'One Stripe Checkout. Cancel anytime. Certificate refreshes every month.',
              },
              {
                n: '03',
                t: 'We verify the data',
                d: 'Your MRR, ARR and customer count are pulled directly from Stripe.',
              },
              {
                n: '04',
                t: 'Share your link',
                d: 'A unique public URL at proof-revenue.vercel.app/c/… you can drop anywhere.',
              },
            ].map((s) => (
              <div key={s.n} className="pt-6 border-t border-ink-900">
                <div className="font-mono text-xs text-ink-400 uppercase mb-3">{s.n}</div>
                <div className="font-serif text-xl tracking-tight mb-2">{s.t}</div>
                <div className="text-sm text-ink-600 leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust row */}
      <div className="px-4 md:px-12 py-10 md:py-14 border-t border-line">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              i: 'shield-check',
              t: 'Server-verified',
              d: 'Every certificate page re-fetches the latest snapshot from our database before render.',
            },
            {
              i: 'lock',
              t: 'No tokens stored',
              d: 'We persist only your Stripe account ID, never OAuth access tokens.',
            },
            {
              i: 'bolt',
              t: 'Refreshed monthly',
              d: 'Your certificate refreshes every billing cycle so data stays credible.',
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

      {/* Example */}
      <div id="example" className="px-4 md:px-12 py-12 md:py-20 border-t border-line bg-paper-alt">
        <div className="max-w-screen-2xl mx-auto">
          <div className="font-mono text-xs font-medium tracking-widest text-ink-400 uppercase mb-4">
            Example certificate
          </div>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight mb-3 leading-tight">
            What investors and buyers will see.
          </h2>
          <p className="text-sm text-ink-600 mb-10 max-w-lg">
            A public URL with live data pulled directly from Stripe. No editing possible — the numbers are what they are.
          </p>
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-sm">
              <MiniCertPreview />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="px-4 md:px-12 py-12 md:py-20 border-t border-line">
        <div className="max-w-screen-2xl mx-auto">
          <div className="font-mono text-xs font-medium tracking-widest text-ink-400 uppercase mb-4">
            Pricing
          </div>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight mb-10 leading-tight">
            One plan. Everything included.
          </h2>

          <div className="max-w-sm">
            <div className="bg-white border border-line rounded-2xl p-8">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif text-5xl tracking-tight">€9</span>
                <span className="text-sm text-ink-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-ink-400 font-mono mb-8">Billed monthly · cancel anytime</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {[
                  'MRR, ARR & customer count',
                  'Shareable public certificate link',
                  'Monthly auto-refresh',
                  'Stripe-verified badge',
                  'Read-only Stripe OAuth',
                  'Live mode only — real data only',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Icon name="check" size={15} color="#18A066" strokeWidth={2} />
                    <span className="text-sm text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant="primary" size="lg" onClick={onStart} className="w-full justify-center">
                Get verified — €9/mo
                <Icon name="arrow-right" size={16} color="white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="px-4 md:px-12 py-12 md:py-20 border-t border-line bg-paper-alt">
        <div className="max-w-screen-2xl mx-auto">
          <div className="font-mono text-xs font-medium tracking-widest text-ink-400 uppercase mb-4">
            FAQ
          </div>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight mb-10 leading-tight">
            Common questions.
          </h2>

          <div className="max-w-2xl space-y-0 divide-y divide-line border-t border-b border-line">
            {[
              {
                q: 'What does ProofRevenue actually verify?',
                a: 'We connect to your Stripe account via read-only OAuth and read your active subscriptions. MRR is the sum of recurring subscription revenue for the current month. ARR is MRR × 12. Customer count is the number of subscriptions with a paid status. One-time payments are excluded.',
              },
              {
                q: 'Is my Stripe data safe?',
                a: 'Yes. We use Stripe Connect with read-only permissions — we can only read data, never initiate charges or make changes. We never store your Stripe access token. Only your Stripe account ID is persisted so we can fetch updated data at the next billing cycle.',
              },
              {
                q: 'What counts as MRR?',
                a: 'Active subscriptions in live mode only. Monthly plans count at face value. Annual plans are normalised to a monthly figure (total / 12). Free trials, paused subscriptions, and cancelled subscriptions are excluded.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your dashboard at any time with one click. Your subscription ends at the current billing period and your certificate link is deactivated immediately.',
              },
              {
                q: 'Does it work with Stripe test mode?',
                a: 'No — ProofRevenue is live mode only. This is intentional. Test data is not real revenue, and the whole point is that investors and buyers can trust the numbers.',
              },
              {
                q: 'What if I disconnect Stripe later?',
                a: 'Your certificate will be marked as pending re-verification. The public link stays live but shows that data cannot be refreshed until Stripe access is restored.',
              },
            ].map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span className="text-sm font-medium text-ink-900">{item.q}</span>
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-ink-400">
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 150ms' }}
                    >
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-sm text-ink-600 leading-relaxed pr-8">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dark CTA section */}
      <div className="px-4 md:px-12 py-12 md:py-20 bg-ink-900 text-paper">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-8 leading-tight">
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
            Get verified — €9/mo
            <Icon name="arrow-right" size={16} color="#0B1220" />
          </Button>
          <p className="mt-4 font-mono text-xs text-ink-400">Cancel anytime · No long-term commitment</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-12 py-7 border-t border-line bg-ink-900 text-ink-300">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo tone="paper" size={14} />
            <span className="font-mono text-xs">© 2026 ProofRevenue</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-xs hover:text-paper transition-colors">IMPRESSUM</a>
            <a href="#" className="font-mono text-xs hover:text-paper transition-colors">DATENSCHUTZ</a>
            <a href="#" className="font-mono text-xs hover:text-paper transition-colors">SUPPORT</a>
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
  };

  return (
    <div className="bg-ink-900 text-paper rounded-2xl p-7 relative shadow-2xl border border-ink-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={14} color="oklch(0.62 0.14 158)" />
          <span className="font-mono text-xs tracking-widest text-ink-300 uppercase">
            VERIFIED · APR 2026
          </span>
        </div>
        <span className="font-mono text-xs text-ink-300">{mockData.certificateId}</span>
      </div>

      <div className="flex items-baseline gap-2.5 mb-7">
        <div className="font-serif text-3xl tracking-tight">{mockData.name}</div>
        <span className="font-mono text-xs text-ink-300">{mockData.domain}</span>
      </div>

      <div className="grid grid-cols-2 gap-0 border border-white border-opacity-10 rounded-lg">
        <div className="px-4 py-4 border-r border-b border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300">MRR</div>
          <div className="font-serif text-3xl tracking-tight mt-1">€{mockData.mrr.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4 border-b border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300">ARR</div>
          <div className="font-serif text-3xl tracking-tight mt-1">€{mockData.arr.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4 border-r border-white border-opacity-10">
          <div className="font-mono text-xs text-ink-300">CUSTOMERS</div>
          <div className="font-serif text-2xl tracking-tight mt-1">{mockData.customers.toLocaleString('en-US')}</div>
        </div>
        <div className="px-4 py-4">
          <div className="font-mono text-xs text-ink-300">ISSUED</div>
          <div className="font-serif text-2xl tracking-tight mt-1">{mockData.verifiedAt}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-white border-opacity-10">
        <span className="font-mono text-xs text-ink-300">proof-revenue.vercel.app/c/{mockData.certificateId}</span>
        <span className="flex items-center gap-1">
          <Icon name="stripe-s" size={10} color="rgba(255,255,255,0.5)" />
          <span className="font-mono text-xs text-ink-300">via Stripe</span>
        </span>
      </div>
    </div>
  );
};
