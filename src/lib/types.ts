// TypeScript types and interfaces

export interface User {
  id: string;
  email: string;
  passwordHash?: string; // Never sent to client
  stripeAccountId: string | null;
  country: string | null;
  livemode: boolean;
  connectedAt: Date | null;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  id: string;
  userId: string;
  refreshTokenHash: string;
  tokenFamily: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  displaySlug: string | null;
  status: 'draft' | 'processing' | 'active' | 'revoked';
  dataStatus: 'pending' | 'ready' | 'failed';
  mrr: number | null;
  arr: number | null;
  totalRevenue: number | null;
  customers: number | null;
  mrrHistory: number[] | null;
  arrHistory: number[] | null;
  snapshotRetryCount: number;
  isPublic: boolean;
  isActive: boolean;
  issuedAt: Date | null;
  verifiedAt: Date | null;
  lastSnapshotAt: Date | null;
  nextRefreshAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  role: string;
  status: 'success' | 'warn' | 'error';
  details: Record<string, any>;
  createdAt: Date;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  processed: boolean;
  createdAt: Date;
}

// Dashboard state types
export type DashboardState =
  | 'unconnected'
  | 'stripe_connected'
  | 'stripe_revoked_before_payment'
  | 'payment_pending'
  | 'data_pending'
  | 'certificate_active'
  | 'stripe_revoked_after_payment';

export interface DashboardContextType {
  state: DashboardState;
  setState: (state: DashboardState) => void;
  user: User | null;
  certificate: Certificate | null;
  isLoading: boolean;
}
