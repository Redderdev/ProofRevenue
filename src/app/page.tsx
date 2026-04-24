'use client';

import React, { useState, useEffect } from 'react';
import { Landing } from '@/components/screens/Landing';
import { StripeOAuth } from '@/components/screens/StripeOAuth';
import { Checkout } from '@/components/screens/Checkout';
import { Dashboard } from '@/components/screens/Dashboard';
import { Button } from '@/components/Button';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';
import { useAuth } from '@/lib/AuthContext';

type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

type AuthMode = 'signin' | 'signup';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [screen, setScreen] = useState('landing');
  const [dashboardState, setDashboardState] = useState<DashboardState>('unconnected');
  const [showTweaks, setShowTweaks] = useState(false);
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);

  // Handle flow actions
  const handleAction = (action: string) => {
    if (action === 'connect') setScreen('oauth');
    if (action === 'pay') setScreen('checkout');
  };

  const handleNav = (nav: string) => {
    setScreen('dashboard');
  };

  const handleSignInClick = () => {
    setAuthModal('signin');
  };

  const handleSignUpClick = () => {
    setAuthModal('signup');
  };

  const handleAuthSuccess = () => {
    setAuthModal(null);
    setScreen('dashboard');
  };

  return (
    <main className="w-full">
      {/* Render active screen */}
      {screen === 'landing' && (
        <Landing 
          onStart={() => setScreen('oauth')}
          onSignIn={handleSignInClick}
        />
      )}

      {screen === 'oauth' && (
        <StripeOAuth
          onComplete={() => {
            setDashboardState('stripe_connected');
            setScreen('dashboard');
          }}
          onCancel={() => setScreen('landing')}
        />
      )}

      {screen === 'checkout' && (
        <Checkout
          onComplete={() => {
            setDashboardState('data_pending');
            setScreen('dashboard');
          }}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          state={dashboardState}
          onNav={handleNav}
          onAction={handleAction}
        />
      )}

      {/* Auth Modal Overlay */}
      {authModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative max-h-[90vh] overflow-y-auto">
            {authModal === 'signin' ? (
              <SignIn
                onSuccess={handleAuthSuccess}
                onSwitchToSignUp={() => setAuthModal('signup')}
              />
            ) : (
              <SignUp
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthModal('signin')}
              />
            )}
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-line hover:bg-paper-alt"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tweaks panel for development */}
      <TweaksPanel
        show={showTweaks}
        dashboardState={dashboardState}
        setDashboardState={setDashboardState}
        onScreenJump={(s) => {
          setScreen(s as any);
        }}
      />

      {/* Toggle tweaks button */}
      <button
        onClick={() => setShowTweaks(!showTweaks)}
        className="fixed bottom-4 left-4 px-3 py-2 bg-ink-900 text-paper rounded text-xs font-mono z-40 hover:bg-ink-800"
      >
        {showTweaks ? '✕ Tweaks' : '⚙ Tweaks'}
      </button>
    </main>
  );
}

const TweaksPanel: React.FC<{
  show: boolean;
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;
  onScreenJump: (screen: string) => void;
}> = ({ show, dashboardState, setDashboardState, onScreenJump }) => {
  if (!show) return null;

  const states: DashboardState[] = [
    'unconnected',
    'stripe_connected',
    'stripe_revoked_before_payment',
    'payment_pending',
    'data_pending',
    'certificate_active',
    'stripe_revoked_after_payment',
  ];

  return (
    <div className="fixed bottom-20 right-4 w-72 p-4 bg-white border border-line rounded-lg shadow-2xl z-50">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-sm font-semibold">Tweaks</div>
        <span className="font-mono text-xs text-ink-400">LIVE</span>
      </div>

      <div className="mb-4">
        <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2">
          Dashboard State
        </div>
        <div className="grid grid-cols-2 gap-2">
          {states.map((s) => (
            <button
              key={s}
              onClick={() => setDashboardState(s)}
              className={`px-2 py-1.5 text-xs rounded border transition-all ${
                dashboardState === s
                  ? 'bg-ink-900 text-paper border-ink-900'
                  : 'bg-white text-ink-600 border-line hover:border-ink-400'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-line my-3" />

      <div>
        <div className="font-mono text-xs letter-spacing-wide text-ink-400 uppercase mb-2">
          Jump to screen
        </div>
        <div className="grid grid-cols-1 gap-1">
          {['landing', 'oauth', 'checkout', 'dashboard'].map((s) => (
            <button
              key={s}
              onClick={() => onScreenJump(s)}
              className="px-2 py-1 text-xs rounded border border-line bg-white hover:bg-paper-alt text-left"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
