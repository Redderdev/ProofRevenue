# ProofRevenue — Production Implementation

A full-stack SaaS application for verified revenue certificates. Connect Stripe, pay once, get a shareable verified link proving your revenue.

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + custom CSS
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT-based (customizable)
- **Payments**: Stripe (OAuth + Checkout)
- **Deployment**: Vercel (recommended) / Docker

## Project Structure

```
proofrevenue/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page with all screens
│   │   └── api/                  # API routes (to be built)
│   ├── components/
│   │   ├── Icon.tsx              # Icon library
│   │   ├── Button.tsx            # Reusable button
│   │   ├── Badge.tsx             # Pill & badges
│   │   ├── Common.tsx            # Shared components
│   │   └── screens/              # Page screens
│   │       ├── Landing.tsx       # Marketing landing
│   │       ├── StripeOAuth.tsx   # OAuth flow
│   │       ├── Checkout.tsx      # Checkout page
│   │       ├── Dashboard.tsx     # Dashboard (7 states)
│   │       ├── Certificate.tsx   # Public certificate
│   │       └── PaymentSuccess.tsx# Success/polling
│   ├── lib/
│   │   ├── db.ts                 # Database schema & setup
│   │   ├── types.ts              # TypeScript types
│   │   ├── utils.ts              # Utility functions
│   │   └── AppContext.tsx        # App state context
│   └── styles/
│       └── globals.css           # Global styles
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── .env.local                    # Environment variables
├── .env.example                  # Example env template
└── README.md                     # This file
```

## Installation

### Prerequisites
- Node.js 18+ (get from [nodejs.org](https://nodejs.org))
- PostgreSQL 14+ ([download](https://www.postgresql.org/download/))
- Git

### 1. Install Dependencies

```bash
cd proofrevenue
npm install
# or
yarn install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/proofrevenue_dev

# Stripe (get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=dev_secret_change_in_prod
```

### 3. Create PostgreSQL Database

```bash
createdb proofrevenue_dev
```

Or via psql:
```sql
CREATE DATABASE proofrevenue_dev;
```

### 4. Initialize Database Schema

```bash
npm run db:setup
```

This will create all necessary tables and indexes.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

### ✅ Frontend
- **Landing Page**: Full marketing website with hero, how-it-works, trust signals, and CTA
- **Stripe OAuth Flow**: 4-step OAuth authorization with account selection
- **Checkout Page**: Stripe Checkout mock with form validation
- **Dashboard**: 7 explicit states (unconnected, connected, revoked, payment pending, data pending, active, revoked after payment)
- **Public Certificate**: Dark-themed revenue certificate with verification seal
- **Success/Polling**: Real-time verification polling page
- **Design System**: Complete component library matching mockup pixel-perfectly
- **Tweaks Panel**: Development panel for state jumping and screen navigation

### 🚀 To Be Built
- Settings page (certificate visibility, slug, manual refresh)
- Admin audit log (RBAC-gated)
- Badge embeds (3 sizes, 2 tones)
- Social sharing (OG cards, badges)
- API routes (Stripe OAuth callback, webhooks, certificate operations)
- Authentication (user registration/login)
- Database persistence (user data, certificates, audit logs)
- Stripe integration (real OAuth, payment processing, webhooks)
- Email notifications

## Development

### Running Screens

The app includes a **Tweaks Panel** (bottom-left corner) for development:
- Jump between dashboard states
- Switch between screens
- Toggle features in real-time

### Key Components

#### Landing Page
Entry point to the app. Explains the service and drives users to get verified.

**Location**: `src/components/screens/Landing.tsx`

#### Dashboard (7 States)
The core experience showing verification progress:
1. **unconnected** - Initial state, connect Stripe
2. **stripe_connected** - OAuth complete, show preview data, ready to pay
3. **stripe_revoked_before_payment** - Connection was revoked before payment
4. **payment_pending** - Waiting for Stripe to confirm payment
5. **data_pending** - Certificate issued, polling for data from Stripe
6. **certificate_active** - ✅ Complete! Certificate is live
7. **stripe_revoked_after_payment** - Connection revoked after payment (re-verification needed)

**Location**: `src/components/screens/Dashboard.tsx`

### Color System

All colors follow the design tokens in `tailwind.config.ts`:

```typescript
ink-950, ink-900, ink-800, ink-700, ink-600, ink-400, ink-300, ink-200, ink-100
paper, paper-alt, paper-dim
line, line-strong
emerald (primary), emerald-soft, emerald-ink
amber, amber-soft
ruby, ruby-soft
```

### Typography

- **Sans**: Inter (300-700 weights)
- **Serif**: Instrument Serif (400, 500, italic)
- **Mono**: JetBrains Mono (400-600)

## API Routes (To Build)

Needed for production:

```
GET  /api/user/me                    - Get current user
POST /api/auth/login                 - User login
POST /api/auth/register              - User registration
POST /api/stripe/oauth-callback      - Stripe OAuth redirect
POST /api/stripe/webhook             - Stripe webhook receiver
POST /api/certificates               - Create certificate
GET  /api/certificates/:id           - Get certificate
PUT  /api/certificates/:id           - Update certificate
GET  /api/certificates/:id/snapshot  - Manual snapshot refresh
POST /api/audit-logs                 - Log admin action
GET  /api/audit-logs                 - List audit logs
```

## Database Schema

### users
- id (UUID, primary key)
- email (VARCHAR, unique)
- stripe_account_id (VARCHAR)
- country (VARCHAR)
- livemode (BOOLEAN)
- connected_at, created_at, updated_at (TIMESTAMP)

### certificates
- id (VARCHAR, primary key)
- user_id (FK to users)
- status (draft|processing|active|revoked)
- data_status (pending|ready|failed)
- mrr, arr, total_revenue, customers (BIGINT, INTEGER)
- mrrHistory, arrHistory (JSONB)
- issued_at, verified_at, next_refresh_at (TIMESTAMP)
- is_public, is_active (BOOLEAN)

### audit_logs
- id (UUID)
- actor, action, target (VARCHAR)
- ip_address (VARCHAR)
- status (success|warn|error)
- details (JSONB)
- created_at (TIMESTAMP)

### stripe_events
- id (VARCHAR, primary key)
- type (VARCHAR)
- data (JSONB)
- processed (BOOLEAN)

## Stripe Integration

### Test Mode Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Test Mode** (toggle top-right)
3. Get keys from **API Keys** section
4. Add to `.env.local`

### Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: 12/28
CVC: 424
```

## Deployment

### Vercel (Recommended)

```bash
npm run build
```

Then push to GitHub and connect to Vercel for one-click deployments.

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package* ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t proofrevenue .
docker run -p 3000:3000 --env-file .env.local proofrevenue
```

## Environment Checklist

- [ ] PostgreSQL database created and running
- [ ] `.env.local` file created with all required variables
- [ ] Stripe test keys added to environment
- [ ] Database schema initialized (`npm run db:setup`)
- [ ] Node modules installed (`npm install`)

## Next Steps

1. **Implement API routes** for authentication and Stripe integration
2. **Connect to PostgreSQL** with real data persistence
3. **Add email notifications** for payment confirmations
4. **Build Settings page** for certificate management
5. **Implement Admin audit log** with RBAC
6. **Add badge embeds** and social sharing
7. **Deploy to Vercel** or Docker

## Support

For issues or questions about the implementation, check:
- `src/lib/types.ts` for all TypeScript interfaces
- `src/lib/utils.ts` for helper functions
- Component files in `src/components/` for implementation details

---

Built with ❤️ • ProofRevenue 2026
