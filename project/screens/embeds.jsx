// Embeddable badges + OG social card + embed-copy UI

// --- EMBEDDABLE BADGES ---

// Full stamp badge (200×200) — hangable card
function BadgeStamp({ dark = true, scale = 1 }) {
  const bg = dark ? "#0F172A" : "#FFFCF5";
  const fg = dark ? "var(--paper)" : "var(--ink-900)";
  const sub = dark ? "var(--ink-300)" : "var(--ink-400)";
  return (
    <div style={{
      width: 200 * scale, height: 200 * scale, background: bg, color: fg,
      borderRadius: 12 * scale, border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "var(--line)"}`,
      padding: 18 * scale, display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: dark ? "0 20px 40px -10px rgba(0,0,0,0.4)" : "0 10px 20px -6px rgba(0,0,0,0.08)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 * scale }}>
          <Icon name="shield-check" size={13 * scale} color="var(--emerald)"/>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9 * scale, letterSpacing: "0.14em", color: sub }}>VERIFIED</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9 * scale, color: sub }}>APR 26</span>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9 * scale, color: sub, letterSpacing: "0.12em" }}>MRR</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 40 * scale, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 2 * scale }}>
          €48,720
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10 * scale, color: sub, marginTop: 8 * scale, letterSpacing: "0.08em" }}>
          CALIAI · 1,284 customers
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10 * scale, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "var(--line)"}` }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 10 * scale, fontWeight: 600 }}>ProofRevenue</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8 * scale, color: sub }}>via ProofRevenue</span>
      </div>
    </div>
  );
}

// Card badge (320×110) — landscape for footers/profiles
function BadgeCard({ dark = true, scale = 1 }) {
  const bg = dark ? "#0F172A" : "#FFFCF5";
  const fg = dark ? "var(--paper)" : "var(--ink-900)";
  const sub = dark ? "var(--ink-300)" : "var(--ink-400)";
  return (
    <div style={{
      width: 320 * scale, height: 110 * scale, background: bg, color: fg,
      borderRadius: 10 * scale, border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "var(--line)"}`,
      padding: 14 * scale, display: "flex", gap: 14 * scale, alignItems: "center",
      boxShadow: dark ? "0 20px 40px -12px rgba(0,0,0,0.35)" : "0 10px 20px -6px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        width: 56 * scale, height: 56 * scale, borderRadius: 28 * scale,
        background: "var(--emerald-soft)", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="shield-check" size={24 * scale} color="var(--emerald-ink)"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9 * scale, color: sub, letterSpacing: "0.12em" }}>
          VERIFIED MRR · VIA PROOFREVENUE
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 30 * scale, letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 2 * scale }}>
          €48,720
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10 * scale, color: sub, marginTop: 4 * scale }}>
          caliAi · proof.revenue/c/cal9x2f4kn
        </div>
      </div>
      <Icon name="arrow-up-right" size={14 * scale} color={sub}/>
    </div>
  );
}

// Pill badge (compact, inline — 220×32)
function BadgePill({ dark = false, scale = 1 }) {
  const bg = dark ? "#0F172A" : "#FFFCF5";
  const fg = dark ? "var(--paper)" : "var(--ink-900)";
  const border = dark ? "rgba(255,255,255,0.12)" : "var(--line-strong)";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8 * scale,
      padding: `${6 * scale}px ${12 * scale}px`, borderRadius: 999,
      background: bg, color: fg, border: `1px solid ${border}`,
      fontFamily: "var(--font-sans)", fontSize: 12 * scale,
    }}>
      <Icon name="logo-mark" size={14 * scale} color="var(--ink-900)"/>
      <span style={{ fontWeight: 600 }}>ProofRevenue</span>
      <span style={{ width: 1, height: 10 * scale, background: border }}/>
      <Icon name="shield-check" size={12 * scale} color="var(--emerald)"/>
      <span style={{ fontWeight: 500 }}>€48,720 MRR verified</span>
    </div>
  );
}

// Embed copy UI — the founder's embed panel
function EmbedCopy({ onNav = () => {} }) {
  const [size, setSize] = React.useState("card");
  const [tone, setTone] = React.useState("dark");
  const [copied, setCopied] = React.useState(false);

  const snippet = `<!-- ProofRevenue · verified badge -->
<a href="https://proof.revenue/c/cal9x2f4kn" target="_blank" rel="noopener">
  <img src="https://proof.revenue/badge/cal9x2f4kn.svg?size=${size}&tone=${tone}"
       alt="Verified €48,720 MRR · via Stripe"
       width="${size === "stamp" ? 200 : size === "card" ? 320 : 220}"
       height="${size === "stamp" ? 200 : size === "card" ? 110 : 32}" />
</a>`;

  const copy = () => {
    navigator.clipboard?.writeText(snippet);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const preview = () => {
    if (size === "stamp") return <BadgeStamp dark={tone === "dark"}/>;
    if (size === "card")  return <BadgeCard  dark={tone === "dark"}/>;
    return <BadgePill dark={tone === "dark"}/>;
  };

  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <AppNav current="certificate" onNav={onNav}/>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div className="pr-eyebrow">Share</div>
        <h1 className="pr-serif" style={{ fontSize: 40, letterSpacing: "-0.025em", margin: "6px 0 10px" }}>
          Embed your verified badge
        </h1>
        <p style={{ color: "var(--ink-600)", fontSize: 14, maxWidth: 620, margin: "0 0 32px", lineHeight: 1.55 }}>
          Drop a live-updating badge on your homepage, pitch deck, or GitHub README.
          The image is regenerated from your latest snapshot every time it's fetched.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 24, alignItems: "start" }}>
          <div className="pr-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="pr-eyebrow">Preview</div>
              <span className="pr-mono" style={{ fontSize: 10, color: "var(--ink-400)", letterSpacing: "0.1em" }}>LIVE · FETCHED ON EACH LOAD</span>
            </div>
            <div style={{ padding: "40px 28px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 280, background: tone === "dark" ? "var(--paper-alt)" : "#FBF9F3" }}>
              {preview()}
            </div>
            <div className="pr-hair"/>
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <div className="pr-kicker" style={{ marginBottom: 8 }}>Size</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["stamp","Stamp"],["card","Card"],["pill","Pill"]].map(([v,l]) => (
                    <button key={v} onClick={() => setSize(v)} className="pr-btn pr-btn-sm" style={{
                      background: size === v ? "var(--ink-900)" : "transparent",
                      color: size === v ? "var(--paper)" : "var(--ink-600)",
                      border: size === v ? "1px solid var(--ink-900)" : "1px solid var(--line)",
                    }}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="pr-kicker" style={{ marginBottom: 8 }}>Tone</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["dark","Dark"],["light","Light"]].map(([v,l]) => (
                    <button key={v} onClick={() => setTone(v)} className="pr-btn pr-btn-sm" style={{
                      background: tone === v ? "var(--ink-900)" : "transparent",
                      color: tone === v ? "var(--paper)" : "var(--ink-600)",
                      border: tone === v ? "1px solid var(--ink-900)" : "1px solid var(--line)",
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pr-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="pr-eyebrow">Embed snippet</div>
              <button className="pr-btn pr-btn-sm" style={{
                background: copied ? "var(--emerald)" : "var(--ink-900)",
                color: "var(--paper)",
              }} onClick={copy}>
                {copied ? <><Icon name="check" size={12}/>Copied</> : <><Icon name="copy" size={12}/>Copy HTML</>}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: 20, fontFamily: "var(--font-mono)", fontSize: 12,
              color: "var(--ink-900)", background: "#FBF9F3", overflow: "auto",
              lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>{snippet}</pre>
            <div className="pr-hair"/>
            <div style={{ padding: 18 }}>
              <div className="pr-kicker" style={{ marginBottom: 10 }}>Also available</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Markdown (README)", "[![Verified MRR](https://proof.revenue/badge/cal9x2f4kn.svg)](https://proof.revenue/c/cal9x2f4kn)"],
                  ["JSON endpoint", "GET https://proof.revenue/api/public/cal9x2f4kn.json"],
                  ["OG image", "https://proof.revenue/og/cal9x2f4kn.png"],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--paper-alt)", borderRadius: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, width: 150, flexShrink: 0 }}>{l}</span>
                    <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-600)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                    <button className="pr-btn pr-btn-sm pr-btn-ghost" style={{ padding: "4px 8px" }}>
                      <Icon name="copy" size={11}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div className="pr-eyebrow" style={{ marginBottom: 16 }}>Badge gallery · all sizes, both tones</div>
          <div className="pr-card" style={{ padding: 36 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: 36, alignItems: "center", justifyContent: "center" }}>
              <BadgeStamp dark={true}/>
              <BadgeCard dark={true}/>
              <BadgePill dark={true}/>
              <BadgeStamp dark={false}/>
              <BadgeCard dark={false}/>
              <BadgePill dark={false}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- OG SOCIAL CARD (1200×630) ---

function OGCard({ variant = "default" }) {
  // variant: default | revoked | data_pending
  return (
    <div style={{
      width: 1200, height: 630, background: "#0B1220", color: "var(--paper)",
      position: "relative", overflow: "hidden", fontFamily: "var(--font-sans)",
    }}>
      {/* grain */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.35,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }}/>
      {/* seal */}
      <div style={{ position: "absolute", top: 60, right: 60, width: 132, height: 132, borderRadius: 66, background: "var(--paper)", color: "var(--ink-900)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(6deg)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}>
        <Icon name="shield-check" size={28} color="var(--emerald)"/>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 6, letterSpacing: "0.16em", fontWeight: 600 }}>VERIFIED</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, marginTop: 2, letterSpacing: "0.14em", color: "var(--ink-400)" }}>APR 2026</div>
      </div>

      {/* top bar */}
      <div style={{ position: "absolute", top: 40, left: 60, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="logo-mark" size={18} color="var(--paper)"/>
        <span style={{ fontWeight: 600, fontSize: 15 }}>ProofRevenue</span>
        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)", margin: "0 6px" }}/>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-300)" }}>
          REVENUE CERTIFICATE · CAL9X2F4KN
        </span>
      </div>

      {/* hero */}
      <div style={{ position: "absolute", left: 60, bottom: 160, right: 60 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.16em", color: "var(--ink-300)", marginBottom: 18 }}>
          THIS CERTIFIES THAT
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 104, letterSpacing: "-0.035em", lineHeight: 1, color: "var(--paper)" }}>
          caliAi
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-300)", marginTop: 14, letterSpacing: "0.04em" }}>
          caliai.co · verified Apr 23, 2026 · via Stripe
        </div>
      </div>

      {/* numbers strip */}
      <div style={{
        position: "absolute", left: 60, bottom: 48, right: 60,
        display: "flex", gap: 0,
        borderTop: "1px solid rgba(255,255,255,0.12)",
        paddingTop: 22,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-300)", letterSpacing: "0.14em" }}>MRR</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 52, letterSpacing: "-0.025em", lineHeight: 1, marginTop: 4 }}>€48,720</div>
        </div>
        <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-300)", letterSpacing: "0.14em" }}>ARR</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 52, letterSpacing: "-0.025em", lineHeight: 1, marginTop: 4 }}>€584,640</div>
        </div>
        <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-300)", letterSpacing: "0.14em" }}>CUSTOMERS</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 52, letterSpacing: "-0.025em", lineHeight: 1, marginTop: 4 }}>1,284</div>
        </div>
        <div style={{ flex: 1.2, borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-300)", letterSpacing: "0.14em" }}>SHARE AT</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, lineHeight: 1.1, marginTop: 8, color: "var(--paper)" }}>
            proof.revenue/c/<br/>cal9x2f4kn
          </div>
        </div>
      </div>
    </div>
  );
}

// OG preview frame — shows the card as it would appear on X/LinkedIn
function OGPreview({ onNav = () => {} }) {
  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <AppNav current="certificate" onNav={onNav}/>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div className="pr-eyebrow">Social</div>
        <h1 className="pr-serif" style={{ fontSize: 40, letterSpacing: "-0.025em", margin: "6px 0 10px" }}>
          Link preview (1200×630)
        </h1>
        <p style={{ color: "var(--ink-600)", fontSize: 14, maxWidth: 620, margin: "0 0 32px", lineHeight: 1.55 }}>
          Every certificate auto-generates an Open Graph image at <span className="pr-mono" style={{ fontSize: 13 }}>/og/[certificateId].png</span>.
          Regenerated on every snapshot so the numbers stay fresh.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <FakeXPost/>
          <FakeLinkedInPost/>
        </div>

        <div className="pr-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="pr-eyebrow">Raw OG image · 1200×630</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="pr-btn pr-btn-sm pr-btn-ghost"><Icon name="copy" size={12}/>Copy URL</button>
              <button className="pr-btn pr-btn-sm pr-btn-primary"><Icon name="external" size={12}/>Download PNG</button>
            </div>
          </div>
          <div style={{ background: "#FBF9F3", padding: 40, display: "flex", justifyContent: "center" }}>
            <div style={{ transform: "scale(0.8)", transformOrigin: "top center", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)" }}>
              <OGCard/>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, padding: 24, background: "var(--paper-alt)", border: "1px solid var(--line)", borderRadius: 10, display: "flex", gap: 14 }}>
          <Icon name="info" size={16} color="var(--ink-400)" style={{ marginTop: 2 }}/>
          <div style={{ fontSize: 13, color: "var(--ink-600)", lineHeight: 1.55 }}>
            <strong style={{ color: "var(--ink-900)" }}>Implementation note:</strong> Render via
            <span className="pr-mono" style={{ fontSize: 12 }}> @vercel/og</span> at the edge, caching on
            <span className="pr-mono" style={{ fontSize: 12 }}> s-maxage=300</span>. Include
            <span className="pr-mono" style={{ fontSize: 12 }}> latestSnapshotId</span> as a cache key so revalidation
            happens automatically when a new snapshot lands.
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeXPost() {
  return (
    <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 14, padding: 16, fontFamily: '"Inter", system-ui' }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "var(--ink-900)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>c</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Cali Ó Briain</span>
            <span style={{ color: "#536471", fontSize: 13 }}>@cali</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.4, marginTop: 4 }}>
            Ok — shipping the scariest thing I've ever shipped. Our MRR is now public and verified. No more "trust me bro" screenshots.
          </div>
        </div>
      </div>
      <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
        <div style={{ width: "100%", aspectRatio: "1200/630", background: "#0B1220", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, transform: "scale(0.36)", transformOrigin: "top left" }}>
            <OGCard/>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", fontSize: 12, color: "#536471" }}>
          <div style={{ textTransform: "lowercase" }}>proof.revenue</div>
          <div style={{ color: "#0f1419", fontSize: 14, marginTop: 2, fontWeight: 500 }}>caliAi · €48,720 MRR verified</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 12, color: "#536471", fontSize: 12 }}>
        <span>↺ 312</span><span>♡ 2.1K</span><span>views 88.4K</span>
      </div>
    </div>
  );
}

function FakeLinkedInPost() {
  return (
    <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: 14, fontFamily: '"Inter", system-ui' }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: "var(--ink-900)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>c</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Cali Ó Briain</div>
          <div style={{ color: "#666", fontSize: 12 }}>Founder, caliAi · 1d</div>
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 12 }}>
        Milestone moment. Our revenue is now <strong>independently verified</strong> against Stripe — numbers don't lie.
      </div>
      <div style={{ width: "100%", aspectRatio: "1200/630", background: "#0B1220", overflow: "hidden", position: "relative", borderRadius: 4 }}>
        <div style={{ position: "absolute", inset: 0, transform: "scale(0.36)", transformOrigin: "top left" }}>
          <OGCard/>
        </div>
      </div>
      <div style={{ padding: "10px 0 0", fontSize: 13, color: "#0a66c2", fontWeight: 600 }}>
        caliAi · €48,720 MRR verified
      </div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>proof.revenue</div>
    </div>
  );
}

Object.assign(window, { BadgeStamp, BadgeCard, BadgePill, EmbedCopy, OGCard, OGPreview });
