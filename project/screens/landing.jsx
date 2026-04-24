// Landing page — full-bleed artboard

function Landing({ onStart = () => {} }) {
  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      {/* top nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", borderBottom: "1px solid var(--line)"
      }}>
        <Logo/>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a style={navLink}>How it works</a>
          <a style={navLink}>Example</a>
          <a style={navLink}>Pricing</a>
          <a style={navLink}>FAQ</a>
          <button className="pr-btn pr-btn-ghost pr-btn-sm" style={{ marginLeft: 8 }}>Sign in</button>
          <button className="pr-btn pr-btn-primary pr-btn-sm" onClick={onStart}>
            Get verified
          </button>
        </div>
      </div>

      {/* hero */}
      <div style={{ padding: "80px 48px 48px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 999, background: "#FFFCF5" }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--emerald)" }}/>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-600)" }}>
                VERIFIED · via Stripe · 2,140 founders
              </span>
            </div>
            <h1 className="pr-serif" style={{
              fontSize: 72, lineHeight: 1.02, letterSpacing: "-0.035em",
              margin: "24px 0 20px", color: "var(--ink-900)",
            }}>
              Prove your revenue.<br/>
              <span style={{ fontStyle: "italic", color: "var(--ink-600)" }}>Not a screenshot.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink-600)", maxWidth: 520, margin: 0 }}>
              Connect Stripe. We pull MRR, ARR and customer count straight from the source,
              then issue a verified public link you can share with investors, buyers and press.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button className="pr-btn pr-btn-primary pr-btn-lg" onClick={onStart}>
                Get verified — €14.99
                <Icon name="arrow-right" size={16}/>
              </button>
              <button className="pr-btn pr-btn-ghost pr-btn-lg">
                See a live certificate
                <Icon name="external" size={14}/>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 28 }}>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>ONE-TIME PAYMENT</span>
              <span style={{ width: 1, height: 12, background: "var(--line)" }}/>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>NO STRIPE TOKENS STORED</span>
              <span style={{ width: 1, height: 12, background: "var(--line)" }}/>
              <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>LIVE-MODE ONLY</span>
            </div>
          </div>

          {/* hero right — mini certificate preview */}
          <div style={{ position: "relative" }}>
            <MiniCertPreview/>
          </div>
        </div>
      </div>

      {/* how it works */}
      <div style={{ padding: "80px 48px", borderTop: "1px solid var(--line)", background: "#FBF9F3" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div className="pr-eyebrow" style={{ marginBottom: 16 }}>How it works</div>
          <h2 className="pr-serif" style={{ fontSize: 40, letterSpacing: "-0.025em", margin: "0 0 48px", maxWidth: 620, lineHeight: 1.1 }}>
            Four steps from signup to a shareable link.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { n: "01", t: "Connect Stripe", d: "OAuth via Stripe Connect. We never see or store your access token." },
              { n: "02", t: "Pay €14.99 once", d: "A single Stripe Checkout charge. No subscription, no hidden fees." },
              { n: "03", t: "We verify the data", d: "Your MRR, ARR and customer count are pulled directly from Stripe." },
              { n: "04", t: "Share your link", d: "A unique public URL at proof.revenue/c/… you can drop anywhere." },
            ].map((s) => (
              <div key={s.n} style={{ padding: "24px 0", borderTop: "1px solid var(--ink-900)" }}>
                <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>{s.n}</div>
                <div className="pr-serif" style={{ fontSize: 22, margin: "14px 0 8px", letterSpacing: "-0.01em" }}>{s.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-600)" }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* trust row */}
      <div style={{ padding: "56px 48px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {[
            { i: "shield-check", t: "Server-verified", d: "Every certificate page re-fetches the latest snapshot from Stripe before render." },
            { i: "lock", t: "No tokens stored", d: "We persist only your Stripe account ID, never OAuth access tokens." },
            { i: "bolt", t: "Refreshed daily", d: "A 03:00 UTC cron refreshes every active certificate so data stays current." },
          ].map(b => (
            <div key={b.i} style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={b.i} size={16}/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.t}</div>
                <div style={{ fontSize: 13, color: "var(--ink-600)", lineHeight: 1.5 }}>{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pr-dark" style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 className="pr-serif" style={{ fontSize: 56, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.05 }}>
            Your revenue deserves a<br/>
            <span style={{ fontStyle: "italic" }}>verified address.</span>
          </h2>
          <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 12 }}>
            <button className="pr-btn pr-btn-lg" style={{ background: "var(--paper)", color: "var(--ink-900)" }} onClick={onStart}>
              Get verified — €14.99
              <Icon name="arrow-right" size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "28px 48px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "var(--ink-900)", color: "var(--ink-300)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo tone="paper" size={14}/>
            <span className="pr-mono" style={{ fontSize: 11 }}>© 2026 · Dublin, Ireland</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)" }}>TERMS</a>
            <a className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)" }}>PRIVACY</a>
            <a className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)" }}>SUPPORT</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const navLink = {
  fontSize: 13, color: "var(--ink-600)", cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

function MiniCertPreview() {
  return (
    <div className="pr-dark" style={{
      borderRadius: 14, padding: 28, position: "relative",
      boxShadow: "0 40px 80px -20px rgba(11,18,32,0.35), 0 10px 20px -8px rgba(11,18,32,0.2)",
      border: "1px solid var(--ink-700)", transform: "rotate(0.4deg)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="shield-check" size={14} color="var(--emerald)"/>
          <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.14em" }}>
            VERIFIED · APR 2026
          </span>
        </div>
        <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)" }}>cal9x2f4kn</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 28 }}>
        <div className="pr-serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>caliAi</div>
        <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)" }}>caliai.co</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
        <div style={{ padding: 16, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>MRR</div>
          <div className="pr-serif" style={{ fontSize: 32, marginTop: 4, letterSpacing: "-0.02em" }}>€48,720</div>
        </div>
        <div style={{ padding: 16 }}>
          <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>ARR</div>
          <div className="pr-serif" style={{ fontSize: 32, marginTop: 4, letterSpacing: "-0.02em" }}>€584,640</div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>CUSTOMERS</div>
          <div className="pr-serif" style={{ fontSize: 22, marginTop: 4 }}>1,284</div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>ISSUED</div>
          <div className="pr-serif" style={{ fontSize: 22, marginTop: 4 }}>Apr 23, 2026</div>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)" }}>proof.revenue/c/cal9x2f4kn</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="stripe-s" size={10} color="var(--ink-300)"/>
          <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)" }}>via Stripe</span>
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { Landing });
