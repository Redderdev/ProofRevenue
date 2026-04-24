// Settings + admin audit log views

function Settings({ onNav = () => {}, onAction = () => {} }) {
  const [isPublic, setIsPublic] = React.useState(true);
  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <AppNav current="settings" onNav={onNav}/>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div className="pr-eyebrow">Settings</div>
        <h1 className="pr-serif" style={{ fontSize: 36, letterSpacing: "-0.025em", margin: "6px 0 32px" }}>
          Manage your certificate
        </h1>

        <Section title="Stripe connection" subtitle="Read-only access to revenue data for acct_1QrXz4···kpLm">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: "var(--ink-900)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="stripe-s" size={16} color="var(--paper)"/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>acct_1QrXz4NmFrAkpLm</div>
                <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)" }}>IRELAND · LIVEMODE · CONNECTED NOV 14, 2025</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Pill tone="emerald">Active</Pill>
              <button className="pr-btn pr-btn-sm pr-btn-ghost">Reconnect</button>
            </div>
          </div>
        </Section>

        <Section title="Certificate" subtitle={`proof.revenue/c/${CALIAI.certificateId}`}>
          <SettingRow
            k="Public visibility"
            d="When off, your certificate URL returns 404. Existing links continue to break until re-enabled."
            right={<Toggle on={isPublic} onChange={setIsPublic}/>}
          />
          <SettingRow
            k="Display slug (cosmetic)"
            d="Adds a trailing slug to your URL. Does not change the certificate ID."
            right={<input className="pr-input" defaultValue="caliai" style={{ width: 200 }}/>}
          />
          <SettingRow
            k="Manual snapshot refresh"
            d="Pulls the latest numbers from Stripe now. Rate-limited to once every 5 minutes."
            right={<button className="pr-btn pr-btn-sm pr-btn-ghost"><Icon name="refresh" size={12}/>Refresh now</button>}
          />
        </Section>

        <Section title="Data status" subtitle="Reflects cert.dataStatus and snapshotRetryCount from the database">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            <KV k="DATA STATUS" v="ready" mono/>
            <KV k="RETRY COUNT" v="0" mono/>
            <KV k="LAST SNAPSHOT" v="Apr 23, 09:41 UTC"/>
            <KV k="NEXT REFRESH" v="Apr 24, 03:00 UTC"/>
          </div>
        </Section>

        <Section title="Danger zone" subtitle="Irreversible actions on this certificate">
          <SettingRow
            k="Revoke certificate"
            d="Sets cert.isActive = false. Your URL returns a 404 permanently."
            right={<button className="pr-btn pr-btn-sm" style={{ background: "var(--ruby-soft)", color: "oklch(0.38 0.13 25)", border: "1px solid oklch(0.80 0.10 25)" }}>Revoke</button>}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="pr-card" style={{ marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
        <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4 }}>{subtitle}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function SettingRow({ k, d, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid var(--line)", gap: 16 }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{k}</div>
        <div style={{ fontSize: 12, color: "var(--ink-400)", lineHeight: 1.5 }}>{d}</div>
      </div>
      <div>{right}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 42, height: 24, borderRadius: 12, background: on ? "var(--emerald)" : "var(--line-strong)",
      border: "none", position: "relative", cursor: "pointer", transition: "background 120ms",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 10,
        background: "white", transition: "left 120ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}/>
    </button>
  );
}

// Admin audit log
function AdminAudit({ onNav = () => {} }) {
  const entries = [
    { t: "Apr 23 · 10:14:02 UTC", a: "sienna@proofrevenue.co", act: "reprocess_certificate", tgt: "cal9x2f4kn", ip: "185.22.14.11", role: "reprocess", s: "success" },
    { t: "Apr 23 · 09:58:31 UTC", a: "sienna@proofrevenue.co", act: "view_certificate_meta", tgt: "jk13ms4p9q", ip: "185.22.14.11", role: "audit", s: "success" },
    { t: "Apr 23 · 09:41:20 UTC", a: "system", act: "snapshot_activate", tgt: "cal9x2f4kn", ip: "10.0.3.21", role: "—", s: "success" },
    { t: "Apr 23 · 09:41:02 UTC", a: "system", act: "webhook_checkout_complete", tgt: "evt_1Pz3xR···", ip: "stripe", role: "—", s: "success" },
    { t: "Apr 23 · 04:22:18 UTC", a: "mira@proofrevenue.co", act: "reprocess_certificate", tgt: "qz7rn88pl2", ip: "92.15.88.201", role: "reprocess", s: "success" },
    { t: "Apr 23 · 03:04:11 UTC", a: "cron", act: "daily_refresh_batch", tgt: "batch_3841", ip: "10.0.3.21", role: "—", s: "success" },
    { t: "Apr 23 · 03:04:07 UTC", a: "cron", act: "circuit_breaker_trip", tgt: "batch_3841", ip: "10.0.3.21", role: "—", s: "warn" },
    { t: "Apr 22 · 22:18:44 UTC", a: "mira@proofrevenue.co", act: "force_revoke_connection", tgt: "acct_1RqJwnT···", ip: "92.15.88.201", role: "reprocess", s: "success" },
    { t: "Apr 22 · 14:02:09 UTC", a: "cron", act: "connection_auto_revoked", tgt: "acct_1RqJwnT···", ip: "10.0.3.21", role: "—", s: "warn" },
    { t: "Apr 22 · 09:11:38 UTC", a: "sienna@proofrevenue.co", act: "export_webhook_events", tgt: "range=24h", ip: "185.22.14.11", role: "audit", s: "success" },
  ];
  return (
    <div className="pr-root" style={{ background: "var(--paper)", minHeight: 900 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 32px", borderBottom: "1px solid var(--line)", background: "var(--ink-900)", color: "var(--paper)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo tone="paper" size={14}/>
          <span className="pr-tag" style={{ color: "var(--paper)", borderColor: "rgba(255,255,255,0.2)" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-300)" }}>2FA · SESSION · 38:12</span>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "var(--paper)", color: "var(--ink-900)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>S</div>
        </div>
      </div>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="pr-eyebrow">Admin · immutable audit log</div>
            <h1 className="pr-serif" style={{ fontSize: 36, letterSpacing: "-0.025em", margin: "6px 0 0" }}>
              Every admin action, forever.
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pr-btn pr-btn-sm pr-btn-ghost"><Icon name="refresh" size={12}/>Refresh</button>
            <button className="pr-btn pr-btn-sm pr-btn-primary">Export CSV</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatTile k="ACTIONS TODAY" v="27" d="+4 vs yesterday"/>
          <StatTile k="CIRCUIT TRIPS" v="1" d="batch_3841 · 03:04 UTC"/>
          <StatTile k="REVOKED CXNS" v="3" d="↑ 20% vs last run" tone="warn"/>
          <StatTile k="RATE-LIMIT HITS" v="0" d="reprocess endpoint"/>
        </div>

        <div className="pr-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
            <Icon name="shield" size={14} color="var(--ink-400)"/>
            <span className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)", letterSpacing: "0.1em" }}>
              AUDIT_LOG · APPEND-ONLY · RLS-SCOPED
            </span>
            <span style={{ flex: 1 }}/>
            <input className="pr-input" placeholder="Filter by actor, action, target…" style={{ width: 280, padding: "6px 10px", fontSize: 12 }}/>
          </div>
          <table className="pr-table" style={{ fontFamily: "var(--font-mono)" }}>
            <thead>
              <tr>
                <th style={{ width: 180 }}>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th style={{ width: 120 }}>Role</th>
                <th style={{ width: 110 }}>IP</th>
                <th style={{ width: 90 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 11, color: "var(--ink-600)" }}>{e.t}</td>
                  <td style={{ fontSize: 12 }}>{e.a}</td>
                  <td style={{ fontSize: 12 }}>{e.act}</td>
                  <td style={{ fontSize: 12, color: "var(--ink-600)" }}>{e.tgt}</td>
                  <td style={{ fontSize: 11 }}>{e.role}</td>
                  <td style={{ fontSize: 11, color: "var(--ink-400)" }}>{e.ip}</td>
                  <td>
                    {e.s === "success" ? <Pill tone="emerald">ok</Pill> : <Pill tone="amber">warn</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="pr-card" style={{ padding: 20 }}>
            <div className="pr-eyebrow" style={{ marginBottom: 12 }}>Reprocess certificate</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="pr-input" placeholder="certificateId"/>
              <button className="pr-btn pr-btn-primary">Reprocess</button>
            </div>
            <div className="pr-mono" style={{ fontSize: 10, color: "var(--ink-400)", marginTop: 10 }}>
              POST /api/admin/reprocess-certificate · RATE 10/min · ROLE reprocess
            </div>
          </div>
          <div className="pr-card" style={{ padding: 20 }}>
            <div className="pr-eyebrow" style={{ marginBottom: 12 }}>Recent webhook events</div>
            {[
              ["evt_1Pz3xR···", "checkout.session.completed", "processed"],
              ["evt_1Pz2wM···", "checkout.session.completed", "processed"],
              ["evt_1Pz2nA···", "payment_intent.payment_failed", "processed"],
            ].map(([id, t, s]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 12, borderTop: "1px solid var(--line)" }}>
                <span className="pr-mono">{id}</span>
                <span style={{ color: "var(--ink-600)" }}>{t}</span>
                <Pill tone="emerald">{s}</Pill>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ k, v, d, tone }) {
  return (
    <div className="pr-card" style={{ padding: 16 }}>
      <div className="pr-kicker" style={{ fontSize: 10 }}>{k}</div>
      <div className="pr-serif" style={{ fontSize: 34, letterSpacing: "-0.02em", marginTop: 4, color: tone === "warn" ? "oklch(0.48 0.14 75)" : "var(--ink-900)" }}>{v}</div>
      <div className="pr-mono" style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4 }}>{d}</div>
    </div>
  );
}

Object.assign(window, { Settings, AdminAudit });
