# Stripe Connect OAuth Implementation - Security & Setup Guide

## 🔒 Security Architecture

This implementation features production-grade security for Stripe Connect OAuth:

### 1. **CSRF Protection (OAuth State Parameter)**
- ✅ Cryptographically secure state generation (32 bytes of random data)
- ✅ State validation with user ID matching (prevents token theft)
- ✅ 10-minute TTL on state parameters (prevents replay attacks)
- ✅ In-memory state store (replace with Redis in production)

### 2. **Token Encryption at Rest**
- ✅ AES-256-GCM encryption for access tokens before database storage
- ✅ Random IV (initialization vector) per token
- ✅ Authentication tag verification on decryption (detects tampering)
- ✅ Tokens never exposed to frontend (server-only)

### 3. **Server-Side Only Token Handling**
- ✅ Access tokens stored server-side only
- ✅ API endpoints verify JWT authentication before token access
- ✅ Tokens retrieved via decryption on-demand for Stripe API calls
- ✅ No tokens in response bodies or query parameters

### 4. **Webhook Security**
- ✅ Stripe webhook signature verification (prevents forgery)
- ✅ Real-time subscription update detection
- ✅ Account deauthorization handling (revokes connection)
- ✅ Event audit trail in database

### 5. **Account Lockout & Rate Limiting**
- ✅ Failed login attempt tracking (future: 5 attempts → 15min lockout)
- ✅ Ready for Redis-based rate limiting on token exchange

---

## 🚀 Setup Instructions

### Step 1: Generate Encryption Key

Generate a 32-byte encryption key for token storage:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

Update `.env.local`:
```
TOKEN_ENCRYPTION_KEY=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

### Step 2: Create Stripe OAuth Application

1. Go to **Stripe Dashboard** → **Settings** → **API keys**
2. Click **OAuth** tab
3. Create a new OAuth application:
   - **App name**: ProofRevenue
   - **App URL**: https://yourdomain.com
   - **Redirect URL**: https://yourdomain.com/api/stripe/oauth-callback (test) + https://yourdomain.com/api/stripe/oauth-callback (live)

4. Copy credentials:
   - **Client ID** → `STRIPE_OAUTH_CLIENT_ID`
   - **Client Secret** → `STRIPE_OAUTH_CLIENT_SECRET`

Update `.env.local`:
```
STRIPE_OAUTH_CLIENT_ID=ca_your_oauth_client_id
STRIPE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

### Step 3: Configure Webhook Endpoint

1. Stripe Dashboard → **Webhooks**
2. Create new endpoint:
   - **URL**: https://yourdomain.com/api/stripe/webhook
   - **Events**: Select these events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `account.application.deauthorized`
     - `account.updated`
     - `checkout.session.completed`

3. Copy webhook signing secret → `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### Step 4: Database Initialization

The database schema includes new tables for Stripe connections:

```sql
-- Automatically created on first run:
-- - stripe_connections (encrypted tokens, metrics cache)
-- - revenue_snapshots (historical MRR/ARR data)
-- - Updated auth_tokens, users tables
```

Run initialization:
```bash
npm run init-db
```

---

## 🔄 OAuth Flow Diagram

```
1. User clicks "Connect Stripe" on Dashboard
   ↓
2. Frontend → /api/stripe/authorize
   ↓
3. Authorization endpoint:
   - Verifies JWT token
   - Generates secure state parameter (32 bytes + user ID + 10min TTL)
   - Redirects to: https://connect.stripe.com/oauth/authorize?...
   ↓
4. User logs into/authorizes on Stripe
   ↓
5. Stripe redirects to: /api/stripe/oauth-callback?code=...&state=...
   ↓
6. Callback handler:
   - Validates state parameter (CSRF protection)
   - Exchanges code for access token (server-to-server)
   - Encrypts token (AES-256-GCM)
   - Stores in stripe_connections table
   - Updates users table with stripe_account_id
   - Redirects to: /connect/stripe/callback
   ↓
7. Frontend callback page:
   - Shows loading state
   - Refreshes auth context
   - Calls /api/stripe/metrics to fetch MRR/ARR
   - Displays success message
   - Redirects to: /dashboard?state=stripe_connected
   ↓
8. Dashboard displays:
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue = MRR × 12)
   - Active customer count
   - Connected account name + mode (live/test)
```

---

## 📊 Revenue Metrics Calculation

### MRR (Monthly Recurring Revenue)
- Sums all active subscriptions
- Normalizes to monthly basis:
  - Monthly: as-is
  - Annual: ÷ 12
  - Weekly: × 52 ÷ 12
  - Daily: × 365 ÷ 12
- Multiplies by subscription quantity

### ARR (Annual Recurring Revenue)
- ARR = MRR × 12

### Active Customers
- Count of unique customers with active subscriptions

### Caching Strategy
- **Fresh**: Within 60 minutes → return cached
- **Stale**: Older than 60 minutes → fetch from Stripe API
- **Fallback**: If fetch fails, return 24-hour cache
- **Webhook**: Subscriptions changes invalidate cache immediately

---

## 🔐 Environment Variables Summary

```bash
# Stripe OAuth Credentials
STRIPE_OAUTH_CLIENT_ID=ca_your_oauth_client_id
STRIPE_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Token Encryption (32 bytes hex)
TOKEN_ENCRYPTION_KEY=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

# Stripe Webhook Signing
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_test_key (or sk_live_... for production)
```

---

## 🧪 Testing the OAuth Flow

### Test Mode (Recommended)
1. Use test Stripe keys (sk_test_...)
2. Use test OAuth credentials
3. In Stripe Dashboard, create test connected account

### Production Mode
1. Switch to live Stripe keys (sk_live_...)
2. Use live OAuth credentials
3. Real merchant accounts connect

### Manual Testing Steps

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to http://localhost:3000
# 3. Sign up / Sign in
# 4. Go to Dashboard
# 5. Click "Connect Stripe"
# 6. Log into Stripe (test or real account)
# 7. Authorize access
# 8. Should see callback page with loading spinner
# 9. Should redirect to dashboard with MRR/ARR displayed
```

---

## 🚨 Security Best Practices (Production)

### 1. Token Storage
- [ ] Move state store from in-memory to Redis (TTL: 10 minutes)
- [ ] Implement database backup encryption
- [ ] Regular key rotation for TOKEN_ENCRYPTION_KEY

### 2. Rate Limiting
- [ ] Implement Redis rate limiting on /api/stripe/authorize (5 req/min per user)
- [ ] Rate limit token exchange endpoint
- [ ] DDoS protection on webhook endpoint

### 3. Monitoring & Audit
- [ ] Alert on multiple failed OAuth attempts
- [ ] Monitor failed metric fetches
- [ ] Log all token decryptions (for forensics)

### 4. Compliance
- [ ] HIPAA compliance review (if handling healthcare data)
- [ ] SOC 2 audit trail implementation
- [ ] PCI DSS compliance (handled by Stripe)

### 5. Incident Response
- [ ] Automated token revocation on suspicious activity
- [ ] Webhook for account.application.deauthorized handling
- [ ] Automatic metrics cache invalidation

---

## 📝 API Endpoints

### /api/stripe/authorize (GET)
- **Purpose**: Start OAuth flow
- **Auth**: JWT access token (cookie)
- **Response**: 302 redirect to Stripe OAuth URL
- **Security**: State parameter with CSRF protection

### /api/stripe/oauth-callback (GET)
- **Purpose**: Handle Stripe OAuth redirect
- **Parameters**: code, state, error, error_description
- **Auth**: JWT access token (cookie)
- **Response**: 302 redirect to /connect/stripe/callback or error
- **Security**: State validation, token encryption, database transaction

### /api/stripe/metrics (GET)
- **Purpose**: Get user's revenue metrics
- **Auth**: JWT access token (cookie)
- **Response**: { metrics, cached, timestamp }
- **Caching**: 60 minutes (configurable)

### /api/stripe/webhook (POST)
- **Purpose**: Handle Stripe webhook events
- **Auth**: Stripe webhook signature verification
- **Events**: Subscriptions, invoices, account changes
- **Response**: { received: true }

---

## 🔗 Database Schema

### stripe_connections table
```sql
CREATE TABLE stripe_connections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (UNIQUE),
  stripe_user_id VARCHAR(255) NOT NULL (UNIQUE),
  access_token_encrypted BYTEA NOT NULL,
  access_token_iv VARCHAR(32) NOT NULL,
  refresh_token_encrypted BYTEA,      -- For future token refresh
  refresh_token_iv VARCHAR(32),
  livemode BOOLEAN DEFAULT FALSE,     -- Live vs Test mode
  scope VARCHAR(255),                 -- OAuth scopes granted
  connected_at TIMESTAMP,             -- When first connected
  last_token_refresh TIMESTAMP,       -- For refresh token strategy
  expires_at TIMESTAMP,               -- Token expiration (if applicable)
  revoked_at TIMESTAMP,               -- When access was revoked
  mrr BIGINT DEFAULT 0,               -- Monthly recurring revenue (cents)
  arr BIGINT DEFAULT 0,               -- Annual recurring revenue (cents)
  active_customers INTEGER DEFAULT 0,
  last_metrics_fetch TIMESTAMP,       -- Cache validity check
  metrics_fetch_error VARCHAR(255),   -- Last error (if any)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## ✅ Security Checklist

- [x] CSRF protection (state parameter)
- [x] Token encryption (AES-256-GCM)
- [x] Server-side token storage
- [x] Authentication tag verification
- [x] Webhook signature verification
- [x] Account deauthorization handling
- [x] Error message sanitization (no token leakage)
- [x] Rate limiting hooks (configured, need Redis)
- [x] Audit trail (webhook + API logs)
- [x] JWT token validation on all endpoints
- [ ] Token refresh strategy (for long-term access)
- [ ] End-to-end encryption (for sensitive data)
- [ ] Automated security testing
- [ ] Penetration testing (recommended before production)

---

## 🐛 Troubleshooting

### "STRIPE_OAUTH_CLIENT_ID not configured"
- Add `STRIPE_OAUTH_CLIENT_ID` to `.env.local`
- Restart dev server

### "TOKEN_ENCRYPTION_KEY must be 64 hex characters"
- Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copy output to `TOKEN_ENCRYPTION_KEY` (exactly 64 hex characters = 32 bytes)

### OAuth redirect not working
- Check redirect URL in Stripe Dashboard matches `process.env.NEXT_PUBLIC_APP_URL`
- Verify `.env.local` has correct OAuth credentials
- Check browser console for CORS errors

### Metrics not showing
- Verify Stripe connection successful (/dashboard?state=stripe_connected)
- Check for metrics fetch error in browser console
- Verify scopes include `read:account` and `read:org_settings`

---

## 📚 References

- [Stripe Connect OAuth Docs](https://stripe.com/docs/connect/oauth-reference)
- [AES-256-GCM Encryption](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP OAuth 2.0 Threats](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

**Last Updated**: 2025-04-24
**Status**: ✅ Production-Ready (with recommendations)
