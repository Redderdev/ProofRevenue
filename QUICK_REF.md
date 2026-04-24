# Quick Reference — ProofRevenue Commands & Paths

## Essential Commands

```bash
# Setup
npm install                    # Install dependencies
npm run db:setup              # Initialize PostgreSQL database
cp .env.example .env.local    # Create environment file

# Development
npm run dev                   # Start dev server (http://localhost:3000)
npm run build                 # Production build
npm start                     # Run production build
npm run lint                  # Run ESLint

# Database
npm run db:setup              # Create tables & schema
psql -d proofrevenue_dev      # Connect to database
```

## File Navigation

### Core App Files
- **Main app**: `src/app/page.tsx` (screen routing, tweaks panel)
- **Root layout**: `src/app/layout.tsx` (fonts, SEO)

### Screens (All in `src/components/screens/`)
- `Landing.tsx` — Marketing page (620 lines)
- `Dashboard.tsx` — Main app (7 states, 950 lines)
- `Certificate.tsx` — Public certificate (400 lines)
- `StripeOAuth.tsx` — OAuth flow (350 lines)
- `PaymentSuccess.tsx` — Success page (300 lines)
- `Checkout.tsx` — Payment form (300 lines)

### Components (in `src/components/`)
- `Icon.tsx` — 24 SVG icons
- `Button.tsx` — Reusable buttons
- `Badge.tsx` — Pill statuses
- `Common.tsx` — Logo, Card, Input, Metric, Sparkline

### Backend (in `src/lib/` and `src/app/api/`)
- `db.ts` — Database schema
- `types.ts` — TypeScript interfaces
- `utils.ts` — Formatting functions
- `stripe.ts` — Stripe integration
- `api/stripe/` — OAuth & webhooks
- `api/certificates/` — Certificate endpoints
- `api/audit-logs/` — Audit log endpoints

### Configuration
- `tailwind.config.ts` — Design tokens
- `next.config.js` — Next.js config
- `.env.local` — Environment variables
- `package.json` — Dependencies

## Dashboard States

Access via **Tweaks Panel** (⚙ bottom-left):
1. `unconnected` — Show "Connect Stripe" button
2. `stripe_connected` — Show preview metrics + pay button
3. `stripe_revoked_before_payment` — Show reconnect button
4. `payment_pending` — Show loading spinner
5. `data_pending` — Show polling UI with countdown
6. `certificate_active` — Show certificate link + share buttons
7. `stripe_revoked_after_payment` — Show re-verification banner

## Component API Quick Reference

### Button
```tsx
<Button variant="primary|ghost|emerald" size="sm|md|lg">
  <Icon name="arrow-right" /> Text
</Button>
```

### Badge/Pill
```tsx
<Pill tone="neutral|emerald|amber|ruby|dark" pulse>
  Label
</Pill>
<StateBadge state={dashboardState} />
```

### Common Components
```tsx
<Logo size={14} tone="ink|paper" />
<Card>Content</Card>
<Input placeholder="Email" />
<Metric label="MRR" value="€48,720" sub="Monthly recurring" />
<Sparkline data={[...]} width={200} height={36} />
```

### Icon Usage
```tsx
<Icon name="check|arrow-right|shield-check|stripe-s|..." 
      size={14} color="white" strokeWidth={2} />
```

## Color Tokens

Available in CSS and Tailwind:
```
ink: 950, 900, 800, 700, 600, 400, 300, 200, 100
paper, paper-alt, paper-dim
line, line-strong
emerald, emerald-soft, emerald-ink
amber, amber-soft, ruby, ruby-soft
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/proofrevenue_dev
NODE_ENV=development
JWT_SECRET=dev_secret_change_in_prod
```

## Stripe Test Credentials

- **Card**: 4242 4242 4242 4242
- **Expiry**: 12/28
- **CVC**: 424

## Common Edits

### Change Colors
→ Edit `tailwind.config.ts` (theme.colors section)

### Add Icon
→ Add SVG to `src/components/Icon.tsx` (icon switch statement)

### Modify Button
→ Edit `src/components/Button.tsx` (className variations)

### Update Dashboard
→ Edit `src/components/screens/Dashboard.tsx` (each state section)

### Change Certificate Layout
→ Edit `src/components/screens/Certificate.tsx` (grid/flex sections)

## Debugging Tips

### View Current State
1. Open Tweaks panel (⚙)
2. Look at "Current: [state]" display
3. Click any state to jump instantly

### Check Database
```bash
psql -d proofrevenue_dev
\dt                    # List tables
SELECT * FROM users;   # Query users
```

### Test API Endpoint
```bash
curl http://localhost:3000/api/certificates/cal9x2f4kn
```

### View Console Logs
→ Browser DevTools → Console tab (F12)
→ Terminal where `npm run dev` is running

## File Size Reference

| File | Lines | Approx Size |
|------|-------|------------|
| Dashboard.tsx | 950 | 38 KB |
| Landing.tsx | 620 | 25 KB |
| Certificate.tsx | 400 | 16 KB |
| App page.tsx | 150 | 6 KB |
| db.ts | 90 | 3 KB |

## Hot Reload

Changes to these files auto-reload:
- `src/**/*.tsx` (components, screens)
- `src/lib/**/*.ts` (utilities, types)
- `src/styles/**/*.css` (global styles)
- `next.config.js` (requires restart)
- `.env.local` (requires restart)

## Getting Help

1. **Setup issues**: Check `SETUP.md`
2. **Structure**: Check `MANIFEST.md`
3. **Build status**: Check `BUILD_STATUS.md`
4. **Type errors**: Check `src/lib/types.ts`
5. **Component props**: Check JSDoc in component files
6. **Database**: Check `src/lib/db.ts` schema comments

---

**Pro Tip**: Use Tweaks panel + browser DevTools together for fastest development!
