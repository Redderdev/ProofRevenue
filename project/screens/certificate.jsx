// Public certificate page — the hero artifact (verified social badge style)

function CertificatePage({ revoked = false, onNav = () => {} }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(`https://proof.revenue/c/${CALIAI.certificateId}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="pr-root" style={{ background: "var(--ink-950)", minHeight: 900, color: "var(--paper)" }}>
      {/* minimal top bar */}
      <div style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Logo tone="paper" size={14}/>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)" }}>
            proof.revenue/c/{CALIAI.certificateId}
          </span>
          <button className="pr-btn pr-btn-sm pr-btn-ghost" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "var(--paper)" }} onClick={copy}>
            {copied ? <><Icon name="check" size={12}/>Copied</> : <><Icon name="link" size={12}/>Copy link</>}
          </button>
        </div>
      </div>

      {revoked && (
        <div style={{ background: "oklch(0.32 0.09 75)", borderBottom: "1px solid oklch(0.45 0.12 75)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <Icon name="warn" size={14} color="oklch(0.92 0.10 85)"/>
          <span style={{ fontSize: 13, color: "oklch(0.95 0.06 85)" }}>
            Revenue data pending re-verification · last verified Apr 22, 2026
          </span>
        </div>
      )}

      {/* Certificate card */}
      <div style={{ padding: "60px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 760, position: "relative" }}>
          {/* seal */}
          <div style={{ position: "absolute", top: -28, right: -28, width: 108, height: 108, borderRadius: 54, background: "var(--paper)", color: "var(--ink-900)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)", transform: "rotate(8deg)", border: "1px solid var(--line)" }}>
            <Icon name="shield-check" size={22} color="var(--emerald)"/>
            <div className="pr-mono" style={{ fontSize: 9, marginTop: 4, letterSpacing: "0.14em" }}>VERIFIED</div>
            <div className="pr-mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-400)" }}>APR 2026</div>
          </div>

          <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", boxShadow: "0 60px 120px -40px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)", letterSpacing: "0.16em" }}>
                  REVENUE CERTIFICATE · ID {CALIAI.certificateId.toUpperCase()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="stripe-s" size={12} color="var(--ink-300)"/>
                  <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>VIA STRIPE · LIVEMODE</span>
                </div>
              </div>
              <div style={{ marginTop: 32, display: "flex", alignItems: "flex-end", gap: 18 }}>
                <div>
                  <div className="pr-eyebrow" style={{ color: "var(--ink-300)", marginBottom: 8 }}>This certifies that</div>
                  <div className="pr-serif" style={{ fontSize: 64, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--paper)" }}>
                    {CALIAI.name}
                  </div>
                </div>
                <div style={{ paddingBottom: 6 }}>
                  <span className="pr-mono" style={{ fontSize: 12, color: "var(--ink-300)" }}>{CALIAI.domain}</span>
                </div>
              </div>
              <div style={{ marginTop: 18, fontSize: 15, lineHeight: 1.5, color: "var(--ink-200)", maxWidth: 560 }}>
                …has its revenue independently verified against Stripe, with the following figures snapshotted on <span style={{ color: "var(--paper)" }}>{CALIAI.verifiedAt}</span>.
              </div>
            </div>

            {/* the numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "28px 40px", borderRight: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="pr-kicker" style={{ color: "var(--ink-300)" }}>MRR · MONTHLY RECURRING</div>
                <div className="pr-serif" style={{ fontSize: 56, letterSpacing: "-0.03em", marginTop: 8, lineHeight: 1, color: "var(--paper)" }}>
                  {eur(CALIAI.mrr)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Sparkline data={CALIAI.mrrHistory} width={200} height={36} color="var(--emerald)"/>
                </div>
              </div>
              <div style={{ padding: "28px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="pr-kicker" style={{ color: "var(--ink-300)" }}>ARR · ANNUAL RECURRING</div>
                <div className="pr-serif" style={{ fontSize: 56, letterSpacing: "-0.03em", marginTop: 8, lineHeight: 1, color: "var(--paper)" }}>
                  {eur(CALIAI.arr)}
                </div>
                <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)", marginTop: 16, letterSpacing: "0.06em" }}>
                  MRR × 12
                </div>
              </div>
              <div style={{ padding: "22px 40px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="pr-kicker" style={{ color: "var(--ink-300)" }}>ACTIVE CUSTOMERS</div>
                <div className="pr-serif" style={{ fontSize: 34, letterSpacing: "-0.02em", marginTop: 6 }}>
                  {num(CALIAI.customers)}
                </div>
              </div>
              <div style={{ padding: "22px 40px" }}>
                <div className="pr-kicker" style={{ color: "var(--ink-300)" }}>CERTIFICATE ISSUED</div>
                <div className="pr-serif" style={{ fontSize: 34, letterSpacing: "-0.02em", marginTop: 6 }}>
                  Apr 23, 2026
                </div>
              </div>
            </div>

            {/* footer strip */}
            <div style={{ padding: "16px 40px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Logo tone="paper" size={12}/>
                <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>
                  proof.revenue/c/{CALIAI.certificateId}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>
                  COUNTRY: IE · LIVEMODE: TRUE
                </span>
                <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-300)", letterSpacing: "0.1em" }}>
                  FETCHED {CALIAI.verifiedAt.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* share row */}
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="pr-btn pr-btn-sm pr-btn-ghost" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "var(--paper)" }}>
              <Icon name="copy" size={12}/>Embed badge
            </button>
            <button className="pr-btn pr-btn-sm pr-btn-ghost" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "var(--paper)" }}>
              Share on X
            </button>
            <button className="pr-btn pr-btn-sm pr-btn-ghost" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "var(--paper)" }}>
              Share on LinkedIn
            </button>
          </div>

          {/* explain strip */}
          <div style={{ marginTop: 48, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
            <div className="pr-eyebrow" style={{ color: "var(--ink-300)", marginBottom: 10 }}>How this is verified</div>
            <div style={{ fontSize: 13, color: "var(--ink-200)", lineHeight: 1.6 }}>
              ProofRevenue reads revenue data directly from Stripe using read-only access to account
              <span className="pr-mono" style={{ color: "var(--paper)" }}> acct_1QrXz4···kpLm</span>. The figures above are
              the most recent snapshot written by the daily cron at 03:00 UTC. The url on this page is stable and re-renders
              from live database state on every request.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CertificatePage });
