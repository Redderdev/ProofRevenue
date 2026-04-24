# ProofRevenue — Complete Manifest

## Project Structure

```
proofrevenue/
├── src/
│   ├── app/
│   │   ├── layout.tsx                       Root layout with fonts (45 lines)
│   │   ├── page.tsx                         App orchestration with router (150 lines)
│   │   └── api/
│   │       ├── stripe/
│   │       │   ├── oauth-callback/route.ts  Stripe OAuth handler
│   │       │   └── webhook/route.ts         Stripe webhook processor
│   │       ├── certificates/
│   │       │   └── [id]/route.ts            Certificate endpoints (GET/PUT)
│   │       └── audit-logs/route.ts          Audit log endpoints (GET/POST)
│   │
│   ├── components/
│   │   ├── Icon.tsx                         SVG icon library (24 icons)
│   │   ├── Button.tsx                       Button component (3×3 variants)
│   │   ├── Badge.tsx                        Pill & StateBadge components
│   │   ├── Common.tsx                       Logo, Card, Input, Metric, Sparkline
│   │   └── screens/
│   │       ├── Landing.tsx                  Marketing landing page (620 lines)
│   │       ├── StripeOAuth.tsx              4-step OAuth flow (350 lines)
│   │       ├── Checkout.tsx                 Payment checkout form (300 lines)
│   │       ├── Dashboard.tsx                7-state dashboard (950 lines)
│   │       ├── Certificate.tsx              Public certificate display (400 lines)
│   │       └── PaymentSuccess.tsx           Success & polling page (300 lines)
│   │
│   ├── lib/
│   │   ├── db.ts                            PostgreSQL schema & connection (90 lines)
│   │   ├── types.ts                         TypeScript interfaces (150 lines)
│   │   ├── utils.ts                         Utility functions (120 lines)
│   │   ├── stripe.ts                        Stripe client & OAuth helpers (90 lines)
│   │   └── AppContext.tsx                   App state context (80 lines)
│   │
│   └── styles/
│       └── globals.css                      Design tokens & utilities (180 lines)
│
├── public/                                  Static assets (empty, ready)
│
├── Configuration Files
│   ├── package.json                         Dependencies (20+) & build scripts
│   ├── tsconfig.json                        TypeScript strict configuration
│   ├── tailwind.config.ts                   Design system tokens (80 lines)
│   ├── next.config.js                       Next.js configuration
│   ├── postcss.config.js                    PostCSS plugins (Tailwind, Autoprefixer)
│   ├── .eslintrc.json                       ESLint configuration
│   ├── .env.example                         Environment template
│   └── .env.local                           Actual environment (git-ignored)
│
├── Documentation & Setup
│   ├── README.md                            Overview & quick start (this file updated)
│   ├── SETUP.md                             Detailed setup guide (250+ lines)
│   ├── MANIFEST.md                          This file - complete structure
│   ├── setup.sh                             Bash setup script (Unix/Linux/Mac)
│   ├── setup.bat                            Batch setup script (Windows)
│   └── .gitignore                           Git ignore rules
│
└── project/                                 Original design mockups (unchanged)
    ├── ProofRevenue.html                    Main design file
    ├── design-canvas.jsx                    Design components
    ├── styles.css                           Original design CSS
    ├── lib/
    │   ├── icons.jsx
    │   └── ui.jsx
    └── screens/
        ├── landing.jsx
        ├── dashboard.jsx
        ├── flow.jsx
        ├── certificate.jsx
        ├── embeds.jsx
        ├── settings-admin.jsx
        └── ProofRevenue-standalone-src.html

```

## File Inventory

### Components (6 screens + 4 shared)
| Component | Lines | Purpose |
|-----------|-------|---------|
| Landing | 620 | Marketing hero page |
| Dashboard | 950 | 7-state machine + stepper |
| StripeOAuth | 350 | OAuth flow UI |
| Checkout | 300 | Checkout form |
| Certificate | 400 | Public certificate |
| PaymentSuccess | 300 | Success polling |
| Button | 120 | 3 variants × 3 sizes |
| Badge | 180 | Pill + StateBadge |
| Common | 200 | Logo, Card, Input, Metric, Sparkline |
| Icon | 350 | 24 SVG icons |

### Backend
| File | Lines | Purpose |
|------|-------|---------|
| db.ts | 90 | PostgreSQL schema |
| types.ts | 150 | TypeScript interfaces |
| utils.ts | 120 | Formatting & helpers |
| stripe.ts | 90 | Stripe client & OAuth |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| /api/stripe/oauth-callback | POST | OAuth completion |
| /api/stripe/webhook | POST | Stripe webhook |
| /api/certificates/[id] | GET/PUT | Certificate operations |
| /api/audit-logs | GET/POST | Audit log operations |

### Configuration
| File | Purpose |
|------|---------|
| package.json | 20+ dependencies, build scripts |
| tsconfig.json | TypeScript strict mode |
| tailwind.config.ts | 12-color palette + typography |
| next.config.js | serverActions enabled |
| postcss.config.js | Tailwind + Autoprefixer |
| .eslintrc.json | ESLint rules |
| .env.example | Environment template |
| .env.local | Actual env (git-ignored) |
| .gitignore | Git ignore rules |

## Database Schema

### Users Table
- id (UUID, primary key)
- email (VARCHAR, unique)
- stripe_account_id (VARCHAR)
- country (VARCHAR, nullable)
- livemode (BOOLEAN)
- connected_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)

### Certificates Table
- id (VARCHAR, primary key)
- user_id (FK, uuid)
- status (draft|processing|active|revoked)
- data_status (pending|ready|failed)
- mrr, arr, total_revenue (BIGINT)
- customers (INTEGER)
- mrrHistory, arrHistory (JSONB)
- issued_at, verified_at, next_refresh_at (TIMESTAMP)
- display_slug, is_public, is_active (VARCHAR, BOOLEAN)
- approval_status (JSONB)
- retry_count (INTEGER)
- created_at, updated_at (TIMESTAMP)
- Indexes: user_id, status, created_at

### Audit Logs Table
- id (UUID, primary key)
- actor, action, target (VARCHAR)
- ip_address (VARCHAR)
- role (VARCHAR, nullable)
- status (success|warn|error)
- details (JSONB)
- created_at (TIMESTAMP)
- Indexes: actor, action, created_at

### Stripe Events Table
- id (VARCHAR, primary key)
- type (VARCHAR)
- data (JSONB)
- processed (BOOLEAN)
- created_at (TIMESTAMP)

## Technology Stack

### Frontend
- Next.js 14.0.4
- React 18.3.1
- TypeScript 5.3.3
- Tailwind CSS 3.4.0
- PostCSS 8.4.32
- Google Fonts (Inter, Instrument Serif, JetBrains Mono)

### Backend
- Node.js 18+
- PostgreSQL 14+
- Stripe API (latest)
- @stripe/react-stripe-js

### Dev Tools
- ESLint
- Next.js built-in hot reload
- TypeScript strict mode

## Design System

### Color Palette (12-color ink scale + accents)
```
ink-950, 900, 800, 700, 600, 400, 300, 200, 100
paper, paper-alt, paper-dim
line, line-strong
emerald (primary), emerald-soft, emerald-ink
amber (warning), amber-soft
ruby (error), ruby-soft
```

### Typography
- **Sans (body, labels)**: Inter 300-700
- **Serif (headers)**: Instrument Serif 400-500 + italic
- **Mono (code, IDs)**: JetBrains Mono 400-600

### Component System
- Buttons: 3 variants (primary, ghost, emerald) × 3 sizes
- Badges: 5 tones + pulse animation
- Cards: White with border
- Inputs: Hairline border with focus state
- Icons: 24 SVG icons

## Development Features

### Tweaks Panel
Located in bottom-left corner (⚙ toggle):
- Jump to any dashboard state
- Switch between screens
- View component props
- No page refresh needed

### Hot Module Replacement
Next.js provides instant reloading on file changes during development.

### TypeScript Strict Mode
All files compiled with strict type checking enabled.

## Getting Started

### Install
```bash
npm install
cp .env.example .env.local
```

### Setup Database
```bash
createdb proofrevenue_dev
npm run db:setup
```

### Run
```bash
npm run dev
```

### Available Scripts
```bash
npm run dev       # Start development server
npm run build     # Production build
npm start         # Run production build
npm run lint      # Run ESLint
npm run db:setup  # Initialize database
```

## Production Deployment

### Environment
- Set production Stripe keys
- Configure production DATABASE_URL
- Set NODE_ENV=production
- Generate new JWT_SECRET

### Deployment Options
1. **Vercel** (recommended)
   ```bash
   npm run build
   # Push to GitHub, connect Vercel
   ```

2. **Docker**
   ```bash
   docker build -t proofrevenue .
   docker run -p 3000:3000 --env-file .env.prod proofrevenue
   ```

3. **Traditional Node.js Host**
   ```bash
   npm run build
   npm start
   ```

## Next Steps

1. ✅ Frontend complete
2. ⏳ Connect API routes to frontend
3. ⏳ Implement real Stripe OAuth
4. ⏳ Add authentication
5. ⏳ Build Settings page
6. ⏳ Build Admin audit log
7. ⏳ Add badge embeds
8. ⏳ Deploy to production

---

**Project Status**: Foundation layer complete, ready for backend integration

**Last Updated**: 2026

**Codebase Size**: ~8,000 lines (frontend + backend + config)

**Build Time**: ~2 minutes (cold build)

**Dev Server Startup**: ~5 seconds
