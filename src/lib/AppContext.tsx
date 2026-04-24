'use client';

import React, { createContext, useContext, useState } from 'react';

export type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

interface AppContextType {
  screen: string;
  setScreen: (screen: string) => void;
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState('landing');
  const [dashboardState, setDashboardState] = useState<DashboardState>('unconnected');

  return (
    <AppContext.Provider value={{ screen, setScreen, dashboardState, setDashboardState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
