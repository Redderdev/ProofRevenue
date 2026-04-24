// Dashboard — renders based on state prop (7 explicit states)

function Dashboard({ state = "unconnected", onNav = () => {}, onAction = () => {} }) {
  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <AppNav current="dashboard" onNav={onNav}/>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div className="pr-eyebrow">Overview</div>
            <h1 className="pr-serif" style={{ fontSize: 44, letterSpacing: "-0.025em", margin: "6px 0 0" }}>
              Your certificate
            </h1>
          </div>
          <StateBadge state={state}/>
        </div>
        <DashboardBody state={state} onAction={onAction}/>
        <OnboardingStepper state={state}/>
      </div>
    </div>
  );
}

function OnboardingStepper({ state }) {
  const step = {
    unconnected: 0, stripe_connected: 1, stripe_revoked_before_payment: 1,
    payment_pending: 2, data_pending: 3, certificate_active: 4,
    stripe_revoked_after_payment: 4,
  }[state];
  const steps = ["Register", "Connect Stripe", "Pay", "Verify data", "Share"];
  return (
    <div style={{ marginTop: 56, padding: "24px 0", borderTop: "1px solid var(--line)" }}>
      <div className="pr-eyebrow" style={{ marginBottom: 16 }}>Onboarding</div>
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                background: done ? "var(--emerald)" : (active ? "var(--ink-900)" : "transparent"),
                border: done || active ? "none" : "1px solid var(--line-strong)",
                color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
              }}>
                {done ? <Icon name="check" size={12} color="white"/> : (active ? i + 1 : <span style={{ color: "var(--ink-300)" }}>{i + 1}</span>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-400)", letterSpacing: "0.08em" }}>
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: done ? "var(--ink-600)" : (active ? "var(--ink-900)" : "var(--ink-400)") }}>
                  {s}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 24, height: 1, background: done ? "var(--emerald)" : "var(--line)", marginRight: 12 }}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardBody({ state, onAction }) {
  if (state === "unconnected") return <StateUnconnected onAction={onAction}/>;
  if (state === "stripe_connected") return <StateConnected onAction={onAction}/>;
  if (state === "stripe_revoked_before_payment") return <StateRevokedPre onAction={onAction}/>;
  if (state === "payment_pending") return <StatePaymentPending onAction={onAction}/>;
  if (state === "data_pending") return <StateDataPending onAction={onAction}/>;
  if (state === "certificate_active") return <StateActive onAction={onAction}/>;
  if (state === "stripe_revoked_after_payment") return <StateRevokedPost onAction={onAction}/>;
  return null;
}

function PanelShell({ children, tone = "light" }) {
  return <div className="pr-card" style={{ padding: 0, overflow: "hidden" }}>{children}</div>;
}

function StateUnconnected({ onAction }) {
  return (
    <PanelShell>
      <div style={{ padding: 40, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>
        <div>
          <h2 className="pr-serif" style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            Connect Stripe to begin
          </h2>
          <p style={{ color: "var(--ink-600)", fontSize: 14, lineHeight: 1.55, margin: "0 0 20px", maxWidth: 440 }}>
            We use Stripe Connect to read your MRR, ARR and customer count. We never see or store your access token — only your Stripe account ID.
          </p>
          <button className="pr-btn pr-btn-primary" onClick={() => onAction("connect")}>
            <Icon name="stripe-s" size={14} color="currentColor"/>
            Connect with Stripe
          </button>
        </div>
        <div style={{
          padding: 24, border: "1px solid var(--line)", borderRadius: 8, background: "var(--paper-alt)"
        }}>
          <div className="pr-eyebrow" style={{ marginBottom: 14 }}>What we read</div>
          {["Monthly recurring revenue", "Annual recurring revenue", "Customer count", "Stripe livemode flag"].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13 }}>
              <Icon name="check" size={14} color="var(--emerald)"/>
              {i}
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function StateConnected({ onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PanelShell>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="stripe-s" size={16}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>acct_1QrXz4···kpLm</div>
              <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>IRELAND · LIVEMODE · CONNECTED NOV 14, 2025</div>
            </div>
          </div>
          <Pill tone="emerald">Active</Pill>
        </div>
        <div style={{ display: "flex" }}>
          <Metric label="MRR (preview)" value="€48,720" sub="From 1,284 subscribers"/>
          <Metric label="ARR (preview)" value="€584,640" sub="MRR × 12"/>
          <Metric label="Customers" value="1,284" sub="Active as of today"/>
          <div style={{ padding: "18px 20px", display: "flex", alignItems: "end" }}>
            <Sparkline data={CALIAI.mrrHistory} width={120} height={40}/>
          </div>
        </div>
      </PanelShell>

      <PanelShell>
        <div style={{ padding: 28, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "center" }}>
          <div>
            <h2 className="pr-serif" style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              Ready to verify
            </h2>
            <p style={{ color: "var(--ink-600)", fontSize: 14, lineHeight: 1.55, margin: "0 0 20px" }}>
              Pay €14.99 once. Your certificate is issued within seconds, and refreshed daily so your numbers stay current.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="pr-btn pr-btn-primary pr-btn-lg" onClick={() => onAction("pay")}>
                Pay €14.99 · Issue certificate
                <Icon name="arrow-right" size={14}/>
              </button>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>ONE-TIME · EUR</span>
            </div>
          </div>
          <div style={{ padding: 24, background: "var(--paper-alt)", border: "1px solid var(--line)", borderRadius: 8 }}>
            <div className="pr-eyebrow" style={{ marginBottom: 12 }}>Receipt preview</div>
            <Row k="Verified revenue certificate" v="€14.99"/>
            <Row k="VAT (reverse charge)" v="—"/>
            <div className="pr-hair" style={{ margin: "10px 0" }}/>
            <Row k="Total" v="€14.99" bold/>
          </div>
        </div>
      </PanelShell>
    </div>
  );
}

function Row({ k, v, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, fontWeight: bold ? 600 : 400 }}>
      <span style={{ color: bold ? "var(--ink-900)" : "var(--ink-600)" }}>{k}</span>
      <span className="pr-mono">{v}</span>
    </div>
  );
}

function StateRevokedPre({ onAction }) {
  return (
    <PanelShell>
      <div style={{ padding: "16px 24px", background: "var(--ruby-soft)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="warn" size={16} color="oklch(0.38 0.13 25)"/>
        <div style={{ fontSize: 13, color: "oklch(0.38 0.13 25)" }}>
          Your Stripe connection was disconnected. Reconnect to continue.
        </div>
      </div>
      <div style={{ padding: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="pr-serif" style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Connection revoked
          </h2>
          <p style={{ color: "var(--ink-600)", fontSize: 14, lineHeight: 1.55, margin: 0, maxWidth: 440 }}>
            Your Stripe connection for acct_1QrXz4···kpLm was disconnected on Apr 21, 2026. Payment is paused until you reconnect.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="pr-btn pr-btn-ghost">Contact support</button>
          <button className="pr-btn pr-btn-primary" onClick={() => onAction("connect")}>
            <Icon name="stripe-s" size={14}/>
            Reconnect Stripe
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

function StatePaymentPending({ onAction }) {
  return (
    <PanelShell>
      <div style={{ padding: 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--amber-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <div className="pr-dot pr-dot-pulse" style={{ color: "oklch(0.55 0.14 75)", width: 8, height: 8 }}/>
        </div>
        <h2 className="pr-serif" style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Payment in progress…
        </h2>
        <p style={{ color: "var(--ink-600)", fontSize: 14, maxWidth: 420, margin: 0 }}>
          We're waiting on Stripe to confirm your payment. This page updates automatically.
        </p>
        <div className="pr-mono" style={{ marginTop: 24, fontSize: 11, color: "var(--ink-400)" }}>
          SESSION cs_live_b1NxK···fQW4 · AMOUNT €14.99
        </div>
      </div>
    </PanelShell>
  );
}

function StateDataPending({ onAction }) {
  const [retry, setRetry] = React.useState(1);
  const [countdown, setCountdown] = React.useState(30);
  React.useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 1 ? c - 1 : 30), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <PanelShell>
      <div style={{ padding: "16px 24px", background: "var(--amber-soft)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="clock" size={16} color="oklch(0.45 0.13 75)"/>
        <div style={{ fontSize: 13, color: "oklch(0.38 0.12 75)" }}>
          Certificate issued. Revenue data loads within a few minutes.
        </div>
      </div>
      <div style={{ padding: 40 }}>
        <h2 className="pr-serif" style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
          Verifying your revenue
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--line)", borderRadius: 8, marginBottom: 24 }}>
          <KV k="ISSUED" v="Apr 23, 2026 · 09:41 UTC"/>
          <KV k="CERTIFICATE" v="cal9x2f4kn" mono/>
          <KV k="RETRY COUNT" v={String(retry)} mono/>
          <KV k="NEXT REFRESH" v={`in ${countdown}s`} mono/>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="pr-btn pr-btn-ghost" onClick={() => setRetry(r => r + 1)}>
            <Icon name="refresh" size={14}/>
            Refresh now
          </button>
          <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>
            AUTO-REFRESH EVERY 30s
          </span>
        </div>
        <div style={{ marginTop: 28, padding: 16, background: "var(--paper-alt)", borderRadius: 6, fontSize: 13, color: "var(--ink-600)", display: "flex", gap: 10 }}>
          <Icon name="info" size={14} color="var(--ink-400)"/>
          Most certificates verify within 60 seconds. If retry count reaches 3 without success, our team is automatically notified.
        </div>
      </div>
    </PanelShell>
  );
}

function KV({ k, v, mono }) {
  return (
    <div style={{ padding: "14px 16px", borderRight: "1px solid var(--line)" }}>
      <div className="pr-kicker" style={{ fontSize: 10 }}>{k}</div>
      <div style={{ fontSize: 13, marginTop: 6, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)" }}>{v}</div>
    </div>
  );
}

function StateActive({ onAction }) {
  const [copied, setCopied] = React.useState(false);
  const copyLink = () => {
    navigator.clipboard?.writeText(`https://proof.revenue/c/${CALIAI.certificateId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PanelShell>
        <div style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name="shield-check" size={16} color="var(--emerald)"/>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--emerald-ink)", letterSpacing: "0.1em" }}>
                CERTIFICATE ACTIVE · VERIFIED {CALIAI.verifiedAt.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line)", padding: "10px 14px", borderRadius: 6, background: "var(--paper-alt)" }}>
              <Icon name="link" size={14} color="var(--ink-400)"/>
              <span className="pr-mono" style={{ fontSize: 13, flex: 1 }}>proof.revenue/c/{CALIAI.certificateId}</span>
              <button className="pr-btn pr-btn-sm pr-btn-ghost" onClick={copyLink}>
                {copied ? <><Icon name="check" size={12}/>Copied</> : <><Icon name="copy" size={12}/>Copy link</>}
              </button>
              <button className="pr-btn pr-btn-sm pr-btn-primary" onClick={() => onAction("view-cert")}>
                <Icon name="external" size={12}/>Open
              </button>
            </div>
          </div>
        </div>
        <div className="pr-hair"/>
        <div style={{ display: "flex" }}>
          <Metric label="MRR" value={eur(CALIAI.mrr)} sub="+3.2% vs last snapshot"/>
          <Metric label="ARR" value={eur(CALIAI.arr)} sub="MRR × 12"/>
          <Metric label="Customers" value={num(CALIAI.customers)} sub="Active"/>
          <Metric label="Total revenue" value={eur(CALIAI.totalRevenue)} sub="Lifetime"/>
        </div>
      </PanelShell>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PanelShell>
          <div style={{ padding: 20 }}>
            <div className="pr-eyebrow" style={{ marginBottom: 12 }}>Snapshot history</div>
            {[
              { d: "Apr 23, 2026 · 09:41 UTC", s: "Success", t: "initial" },
              { d: "Apr 22, 2026 · 03:00 UTC", s: "Success", t: "daily" },
              { d: "Apr 21, 2026 · 03:00 UTC", s: "Success", t: "daily" },
              { d: "Apr 20, 2026 · 03:00 UTC", s: "Success", t: "daily" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                <div className="pr-mono" style={{ fontSize: 12, color: "var(--ink-600)" }}>{e.d}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="pr-tag">{e.t.toUpperCase()}</span>
                  <Pill tone="emerald">{e.s}</Pill>
                </div>
              </div>
            ))}
          </div>
        </PanelShell>
        <PanelShell>
          <div style={{ padding: 20 }}>
            <div className="pr-eyebrow" style={{ marginBottom: 12 }}>Certificate metadata</div>
            <Row k="Certificate ID" v={CALIAI.certificateId}/>
            <Row k="Stripe account" v="acct_1QrXz4···kpLm"/>
            <Row k="Livemode" v="✓ true"/>
            <Row k="Country" v={CALIAI.country}/>
            <Row k="Public" v="✓ true"/>
            <Row k="Data status" v="ready"/>
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function StateRevokedPost({ onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PanelShell>
        <div style={{ padding: "16px 24px", background: "var(--amber-soft)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="warn" size={16} color="oklch(0.45 0.13 75)"/>
          <div style={{ fontSize: 13, color: "oklch(0.38 0.12 75)" }}>
            Revenue data pending re-verification — Stripe connection was revoked on Apr 22, 2026.
          </div>
        </div>
        <div style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line)", padding: "10px 14px", borderRadius: 6, background: "var(--paper-alt)" }}>
              <Icon name="link" size={14} color="var(--ink-400)"/>
              <span className="pr-mono" style={{ fontSize: 13, flex: 1 }}>proof.revenue/c/{CALIAI.certificateId}</span>
              <button className="pr-btn pr-btn-sm pr-btn-ghost">
                <Icon name="copy" size={12}/>Copy link
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-400)" }}>
              Your existing link remains live but shows a re-verification banner until reconnected.
            </div>
          </div>
          <button className="pr-btn pr-btn-primary" onClick={() => onAction("connect")}>
            <Icon name="stripe-s" size={14}/>
            Reconnect Stripe
          </button>
        </div>
      </PanelShell>
    </div>
  );
}

Object.assign(window, { Dashboard });
