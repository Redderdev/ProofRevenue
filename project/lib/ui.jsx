// Shared UI bits for ProofRevenue prototype

function Logo({ tone = "ink", size = 16 }) {
  const color = tone === "ink" ? "var(--ink-900)" : "var(--paper)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color }}>
      <Icon name="logo-mark" size={size + 4} color={color}/>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: size, letterSpacing: "-0.02em" }}>
        ProofRevenue
      </span>
    </div>
  );
}

function Pill({ tone = "neutral", pulse = false, children }) {
  const cls = `pr-pill pr-pill-${tone}`;
  return (
    <span className={cls}>
      <span className={`pr-dot ${pulse ? "pr-dot-pulse" : ""}`} style={{ background: "currentColor" }}/>
      {children}
    </span>
  );
}

// Format number as EUR
function eur(n, { compact = false } = {}) {
  if (compact) {
    if (n >= 1_000_000) return `€${(n/1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 10_000) return `€${Math.round(n/1000)}k`;
    if (n >= 1_000) return `€${(n/1000).toFixed(1)}k`;
    return `€${n}`;
  }
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function num(n) {
  return new Intl.NumberFormat("en-IE").format(n);
}

// Top navigation for app pages
function AppNav({ current = "dashboard", userEmail = "founder@caliai.co", onNav = () => {} }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "certificate", label: "Certificate" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 32px", borderBottom: "1px solid var(--line)",
      background: "var(--paper)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Logo/>
        <nav style={{ display: "flex", gap: 4 }}>
          {items.map(it => (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: current === it.id ? "var(--ink-900)" : "var(--ink-400)",
              padding: "6px 10px", borderRadius: 5,
              fontWeight: current === it.id ? 500 : 400,
            }}>
              {it.label}
            </button>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>{userEmail}</span>
        <div style={{
          width: 26, height: 26, borderRadius: 13, background: "var(--ink-900)",
          color: "var(--paper)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600,
        }}>
          {userEmail.slice(0,1).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// State pill used across dashboard states
function StateBadge({ state }) {
  const map = {
    unconnected: { tone: "neutral", label: "Unconnected" },
    stripe_connected: { tone: "emerald", label: "Stripe connected" },
    stripe_revoked_before_payment: { tone: "ruby", label: "Connection revoked" },
    payment_pending: { tone: "amber", label: "Payment processing", pulse: true },
    data_pending: { tone: "amber", label: "Data pending", pulse: true },
    certificate_active: { tone: "emerald", label: "Verified" },
    stripe_revoked_after_payment: { tone: "amber", label: "Re-verification needed" },
  };
  const s = map[state] ?? map.unconnected;
  return <Pill tone={s.tone} pulse={s.pulse}>{s.label}</Pill>;
}

// Metric block used on dashboard/certificate
function Metric({ label, value, sub, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <div style={{
      padding: "18px 20px",
      borderRight: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--line)",
      flex: 1,
    }}>
      <div className="pr-kicker" style={{ color: isDark ? "var(--ink-300)" : "var(--ink-400)" }}>{label}</div>
      <div className="pr-serif" style={{
        fontSize: 34, lineHeight: 1.05, marginTop: 6,
        color: isDark ? "var(--paper)" : "var(--ink-900)",
        letterSpacing: "-0.02em",
      }}>
        {value}
      </div>
      {sub && (
        <div className="pr-mono" style={{ fontSize: 11, marginTop: 6, color: isDark ? "var(--ink-300)" : "var(--ink-400)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Sparkline (SVG)
function Sparkline({ data, height = 36, width = 140, color = "var(--emerald)" }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={(data.length - 1) * step} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="2.5" fill={color}/>
    </svg>
  );
}

// Mock data — caliAi
const CALIAI = {
  name: "caliAi",
  domain: "caliai.co",
  country: "Ireland",
  livemode: true,
  connected: "2025-11-14",
  issuedAt: "2026-04-23",
  verifiedAt: "2026-04-23 09:41 UTC",
  certificateId: "cal9x2f4kn",
  mrr: 48720,
  arr: 584640,
  totalRevenue: 1247300,
  customers: 1284,
  mrrHistory: [18200, 21900, 24300, 27800, 31200, 34600, 38100, 41900, 44800, 46500, 47200, 48720],
  arrHistory: [218400, 262800, 291600, 333600, 374400, 415200, 457200, 502800, 537600, 558000, 566400, 584640],
};

Object.assign(window, { Logo, Pill, AppNav, StateBadge, Metric, Sparkline, eur, num, CALIAI });
