// OAuth flow, checkout flow, success/polling page

function StripeOAuth({ onComplete = () => {}, onCancel = () => {} }) {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 1200);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div style={{ background: "#635BFF", minHeight: 900, fontFamily: "var(--font-sans)", color: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Icon name="stripe-s" size={22} color="white"/>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Connect</span>
          <span style={{ opacity: 0.6, fontSize: 12 }}>· Connecting to ProofRevenue</span>
        </div>
        <span className="pr-mono" style={{ fontSize: 11, opacity: 0.7 }}>MOCK · DEMO</span>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "60px 24px" }}>
        <div style={{ width: 520, background: "white", color: "var(--ink-900)", borderRadius: 12, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="logo-mark" size={18} color="var(--ink-900)"/>
            <div style={{ fontSize: 13, fontWeight: 500 }}>ProofRevenue is requesting access</div>
          </div>

          {step === 0 && (
            <div style={{ padding: 28 }}>
              <div className="pr-eyebrow" style={{ marginBottom: 10 }}>Sign in to continue</div>
              <h3 style={{ fontSize: 20, margin: "0 0 20px", fontWeight: 500 }}>Sign in to your Stripe account</h3>
              <label style={{ fontSize: 12, color: "var(--ink-600)" }}>Email</label>
              <input className="pr-input" defaultValue="founder@caliai.co" style={{ marginTop: 4, marginBottom: 14 }}/>
              <label style={{ fontSize: 12, color: "var(--ink-600)" }}>Password</label>
              <input className="pr-input" type="password" defaultValue="••••••••••••" style={{ marginTop: 4, marginBottom: 20 }}/>
              <button className="pr-btn pr-btn-primary" style={{ width: "100%", justifyContent: "center", background: "#635BFF" }} onClick={() => setStep(1)}>
                Continue
                <Icon name="arrow-right" size={14}/>
              </button>
              <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "var(--ink-400)" }}>
                <a style={{ cursor: "pointer" }} onClick={onCancel}>Cancel and return to ProofRevenue</a>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ padding: 28 }}>
              <div className="pr-eyebrow" style={{ marginBottom: 10 }}>Select account</div>
              <h3 style={{ fontSize: 20, margin: "0 0 6px", fontWeight: 500 }}>Choose a Stripe account</h3>
              <p style={{ fontSize: 13, color: "var(--ink-600)", margin: "0 0 18px" }}>
                You'll grant read-only access to revenue data for the account you pick.
              </p>
              {[
                { n: "caliAi", id: "acct_1QrXz4NmFrAkpLm", country: "Ireland", live: true },
                { n: "caliAi (sandbox)", id: "acct_1TestRfuoJfak22", country: "Ireland", live: false },
              ].map((a, i) => (
                <button key={a.id} onClick={() => a.live && setStep(2)} disabled={!a.live} style={{
                  width: "100%", textAlign: "left", padding: 14, borderRadius: 8, border: "1px solid var(--line)",
                  background: "var(--paper)", marginBottom: 10, cursor: a.live ? "pointer" : "not-allowed",
                  opacity: a.live ? 1 : 0.5, display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "var(--ink-900)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                    cA
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.n}</div>
                    <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>{a.id.slice(0,18)}··· · {a.country}</div>
                  </div>
                  {a.live ? <Pill tone="emerald">Livemode</Pill> : <Pill tone="neutral">Test</Pill>}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ padding: 28 }}>
              <div className="pr-eyebrow" style={{ marginBottom: 10 }}>Review scopes</div>
              <h3 style={{ fontSize: 20, margin: "0 0 14px", fontWeight: 500 }}>ProofRevenue will be able to:</h3>
              {[
                ["Read subscription MRR and ARR", "check"],
                ["Read active customer count", "check"],
                ["Read livemode flag and country", "check"],
              ].map(([t, i]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13 }}>
                  <Icon name={i} size={14} color="var(--emerald)"/>{t}
                </div>
              ))}
              <div style={{ marginTop: 14, padding: 12, background: "var(--paper-alt)", borderRadius: 6, fontSize: 12, color: "var(--ink-600)" }}>
                ProofRevenue <strong>cannot</strong> create charges, issue refunds, read customer PII, or move funds.
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
                <div className="pr-dot pr-dot-pulse" style={{ color: "var(--ink-900)", width: 6, height: 6 }}/>
                <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>Authorising…</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: "var(--emerald-soft)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={26} color="var(--emerald)" strokeWidth={2}/>
              </div>
              <h3 style={{ fontSize: 22, margin: "0 0 8px", fontWeight: 500 }}>Connected</h3>
              <p style={{ fontSize: 13, color: "var(--ink-600)", margin: "0 0 20px" }}>
                Redirecting you back to ProofRevenue…
              </p>
              <button className="pr-btn pr-btn-primary" onClick={onComplete}>
                Continue to ProofRevenue
                <Icon name="arrow-right" size={14}/>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkout({ onComplete = () => {}, onCancel = () => {} }) {
  const [loading, setLoading] = React.useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(onComplete, 1500);
  };
  return (
    <div style={{ background: "#F6F9FC", minHeight: 900, fontFamily: "var(--font-sans)", display: "flex" }}>
      <div style={{ flex: 1, padding: "48px 60px", maxWidth: 540 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <a onClick={onCancel} style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-400)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="chevron-right" size={14} style={{ transform: "rotate(180deg)" }}/>
            ProofRevenue
          </a>
        </div>
        <div className="pr-eyebrow" style={{ marginBottom: 8 }}>ProofRevenue · One-time</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <div className="pr-serif" style={{ fontSize: 48, letterSpacing: "-0.02em" }}>€14.99</div>
          <span className="pr-mono" style={{ fontSize: 12, color: "var(--ink-400)" }}>EUR</span>
        </div>
        <div style={{ fontSize: 14, color: "var(--ink-600)", marginBottom: 32 }}>Verified revenue certificate · 1 × caliAi</div>

        <div style={{ padding: "14px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
          <Row k="Subtotal" v="€14.99"/>
          <Row k="VAT" v="—"/>
        </div>
        <div style={{ padding: "14px 0", fontSize: 14, fontWeight: 600 }}>
          <Row k="Total due today" v="€14.99" bold/>
        </div>
      </div>
      <div style={{ flex: 1, background: "white", padding: "48px 60px", borderLeft: "1px solid var(--line)" }}>
        <div style={{ fontSize: 14, color: "var(--ink-400)", marginBottom: 20 }}>Pay with card</div>
        <label style={lbl}>Email</label>
        <input className="pr-input" defaultValue="founder@caliai.co"/>
        <label style={{ ...lbl, marginTop: 16 }}>Card information</label>
        <input className="pr-input" defaultValue="4242 4242 4242 4242"/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          <input className="pr-input" defaultValue="12 / 28"/>
          <input className="pr-input" defaultValue="424"/>
        </div>
        <label style={{ ...lbl, marginTop: 16 }}>Cardholder name</label>
        <input className="pr-input" defaultValue="Cali Ó Briain"/>
        <label style={{ ...lbl, marginTop: 16 }}>Country</label>
        <input className="pr-input" defaultValue="Ireland"/>

        <button onClick={submit} disabled={loading} className="pr-btn pr-btn-primary pr-btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 28, background: "#635BFF" }}>
          {loading ? <><span className="pr-dot pr-dot-pulse" style={{ color: "white", width: 6, height: 6 }}/>Processing…</> : <>Pay €14.99</>}
        </button>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-400)" }}>POWERED BY STRIPE · MOCK</span>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, color: "var(--ink-600)", marginBottom: 4, marginTop: 0 };

// Success / polling page
function PaymentSuccess({ onComplete = () => {}, onNav = () => {} }) {
  const [phase, setPhase] = React.useState("verifying"); // verifying -> ready
  const [dots, setDots] = React.useState(0);
  const [retry, setRetry] = React.useState(0);
  React.useEffect(() => {
    const d = setInterval(() => setDots(x => (x + 1) % 4), 500);
    return () => clearInterval(d);
  }, []);
  React.useEffect(() => {
    if (phase !== "verifying") return;
    const t = setTimeout(() => setPhase("ready"), 4200);
    const r = setInterval(() => setRetry(x => x + 1), 1800);
    return () => { clearTimeout(t); clearInterval(r); };
  }, [phase]);

  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <AppNav current="dashboard" onNav={onNav}/>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: phase === "ready" ? "var(--emerald-soft)" : "var(--paper-alt)", border: "1px solid var(--line)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {phase === "ready"
              ? <Icon name="check" size={28} color="var(--emerald)" strokeWidth={2}/>
              : <div className="pr-dot pr-dot-pulse" style={{ color: "var(--ink-900)", width: 10, height: 10 }}/>
            }
          </div>
          <div className="pr-eyebrow" style={{ marginBottom: 8 }}>
            {phase === "ready" ? "CERTIFICATE ACTIVE" : "PAYMENT · SUCCEEDED"}
          </div>
          <h1 className="pr-serif" style={{ fontSize: 40, letterSpacing: "-0.025em", margin: 0 }}>
            {phase === "ready" ? "Your certificate is live." : `Verifying your revenue${".".repeat(dots)}`}
          </h1>
          <p style={{ color: "var(--ink-600)", fontSize: 15, marginTop: 14, maxWidth: 460, marginInline: "auto" }}>
            {phase === "ready"
              ? "We just wrote the first snapshot from Stripe. Your public link is ready to share."
              : "Payment confirmed. We're pulling your first revenue snapshot from Stripe."
            }
          </p>
        </div>

        <div className="pr-card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            <KV k="CERTIFICATE" v={CALIAI.certificateId} mono/>
            <KV k="ISSUED" v="Apr 23, 09:41 UTC"/>
            <KV k="RETRY COUNT" v={String(retry)} mono/>
            <KV k="STATUS" v={phase === "ready" ? "ready" : "pending"} mono/>
          </div>
          <div className="pr-hair"/>
          <div style={{ padding: 20 }}>
            <StepsChecklist phase={phase} retry={retry}/>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 10 }}>
          {phase === "ready"
            ? <>
                <button className="pr-btn pr-btn-ghost" onClick={onComplete}>
                  Go to dashboard
                </button>
                <button className="pr-btn pr-btn-primary" onClick={() => onNav("certificate")}>
                  Open your certificate
                  <Icon name="arrow-right" size={14}/>
                </button>
              </>
            : <>
                <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)", alignSelf: "center" }}>
                  AUTO-REFRESH EVERY 30s · PAGE URL IS STABLE — YOU CAN BOOKMARK IT
                </span>
              </>
          }
        </div>
      </div>
    </div>
  );
}

function StepsChecklist({ phase, retry }) {
  const steps = [
    { k: "payment_succeeded", t: "Payment succeeded", done: true },
    { k: "webhook_received", t: "Webhook verified", done: true },
    { k: "cert_created", t: "Certificate row created", done: true },
    { k: "snapshot_fetched", t: "First revenue snapshot", done: phase === "ready" },
    { k: "cert_activated", t: "Certificate activated", done: phase === "ready" },
  ];
  return (
    <div>
      {steps.map(s => (
        <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
          <div style={{
            width: 18, height: 18, borderRadius: 9, flexShrink: 0,
            background: s.done ? "var(--emerald)" : "transparent",
            border: s.done ? "none" : "1.5px dashed var(--line-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {s.done && <Icon name="check" size={10} color="white" strokeWidth={2.4}/>}
          </div>
          <div style={{ fontSize: 13, color: s.done ? "var(--ink-900)" : "var(--ink-400)" }}>{s.t}</div>
          <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-400)", marginLeft: "auto" }}>{s.k}</div>
        </div>
      ))}
      {!steps[3].done && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)", paddingLeft: 30 }}>
          polling Stripe… attempt {retry + 1}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StripeOAuth, Checkout, PaymentSuccess });
