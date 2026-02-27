"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { OwnerSidebar } from "../components/OwnerSidebar";

// ─── Data ────────────────────────────────────────────────────────────────────
const WEEK = [
  { day: "Man", revenue: 7840 },
  { day: "Tir", revenue: 9120 },
  { day: "Ons", revenue: 6580 },
  { day: "Tor", revenue: 11200 },
  { day: "Fre", revenue: 13440 },
  { day: "Lør", revenue: 9680 },
  { day: "I dag", revenue: 8760 },
];

const MONTH = [
  { day: "3. mar", revenue: 38400 },
  { day: "6. mar", revenue: 41200 },
  { day: "9. mar", revenue: 36800 },
  { day: "12. mar", revenue: 44600 },
  { day: "15. mar", revenue: 49100 },
  { day: "18. mar", revenue: 42300 },
  { day: "21. mar", revenue: 51200 },
  { day: "I dag", revenue: 47800 },
];

const YEAR = [
  { day: "Jan", revenue: 124500 },
  { day: "Feb", revenue: 118200 },
  { day: "Mar", revenue: 142800 },
  { day: "Apr", revenue: 155400 },
  { day: "Maj", revenue: 168200 },
  { day: "Jun", revenue: 145600 },
  { day: "Jul", revenue: 122000 },
  { day: "Aug", revenue: 138900 },
  { day: "Sep", revenue: 162400 },
  { day: "Okt", revenue: 175800 },
  { day: "Nov", revenue: 168300 },
  { day: "Dec", revenue: 198600 },
];

type Period = "Uge" | "Maaned" | "Aar";

const PERIOD_LABELS: Record<Period, string> = { Uge: "Uge", Maaned: "Måned", Aar: "År" };

const CHART_DATA: Record<Period, { day: string; revenue: number }[]> = {
  Uge: WEEK, Maaned: MONTH, Aar: YEAR,
};

const CHART_META: Record<Period, { title: string; sub: string; kpiLabel: string; kpiSub: string; kpiTotal: number }> = {
  Uge:    { title: "Omsætning – denne uge",  sub: "Daglig omsætning i DKK",    kpiLabel: "Uge – omsætning",   kpiSub: "Man 17 – I dag",  kpiTotal: 66620 },
  Maaned: { title: "Omsætning – denne måned", sub: "Omsætning per 3 dage",      kpiLabel: "Måned – omsætning", kpiSub: "Marts 2026",      kpiTotal: 351400 },
  Aar:    { title: "Omsætning – dette år",    sub: "Månedlig omsætning i DKK",  kpiLabel: "År – omsætning",   kpiSub: "Jan – Dec 2026",  kpiTotal: 1722200 },
};

const TODAY_APTS = [
  { time: "09:00", client: "Henrik Bruun",   service: "Hot Towel Shave", barber: "Marcus", dur: 40, price: 220, done: true },
  { time: "10:00", client: "Maja Lindström", service: "Farve & Stil",    barber: "Sofia",  dur: 90, price: 550, done: true },
  { time: "11:30", client: "Lars Thomsen",   service: "Classic Cut",     barber: "Emil",   dur: 45, price: 260, done: true },
  { time: "13:00", client: "Oliver Brink",   service: "Cut & Beard",     barber: "Marcus", dur: 70, price: 390, done: false },
  { time: "14:30", client: "Stine Krogh",    service: "Farve & Stil",    barber: "Sofia",  dur: 90, price: 550, done: false },
  { time: "15:30", client: "Adam Schäfer",   service: "Cut & Beard",     barber: "Emil",   dur: 70, price: 390, done: false },
  { time: "17:00", client: "Jesper Winther", service: "Classic Cut",     barber: "Marcus", dur: 45, price: 260, done: false },
];

const TOP_SERVICES = [
  { name: "Farve & Stil",    rev: 12100, pct: 80, color: "#C49BBF" },
  { name: "Classic Cut",     rev: 9880,  pct: 65, color: "#B8985A" },
  { name: "Cut & Beard",     rev: 7020,  pct: 46, color: "#C4977A" },
  { name: "Beard Sculpt",    rev: 4680,  pct: 31, color: "#7BA3C4" },
  { name: "Hot Towel Shave", rev: 3080,  pct: 20, color: "#7BBFA5" },
];

const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A",  "Farve & Stil": "#C49BBF",
};

function fmtDKK(n: number) { return n.toLocaleString("da-DK") + " kr."; }

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
function AreaChart({ data }: { data: typeof WEEK }) {
  const W = 580, H = 130, pad = { l: 8, r: 8, t: 20, b: 0 };
  const max = Math.max(...data.map(d => d.revenue)) * 1.12;
  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - d.revenue / max) * (H - pad.t - pad.b),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "130px", overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(184,152,90,0.28)"/>
          <stop offset="100%" stopColor="rgba(184,152,90,0)"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => {
        const y = pad.t + (1 - f) * (H - pad.t - pad.b);
        return <line key={f} x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(245,239,228,0.05)" strokeWidth="1"/>;
      })}
      <path d={areaPath} fill="url(#areaGrad)"/>
      <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === data.length - 1 ? 5 : 3}
          fill={i === data.length - 1 ? "var(--gold)" : "var(--bg)"}
          stroke="var(--gold)" strokeWidth="1.5"/>
      ))}
      {(() => { const p = pts[pts.length - 1]; return (
        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--gold)" fontSize="9" fontWeight="700" fontFamily="Inter,sans-serif">
          {fmtDKK(data[data.length - 1].revenue)}
        </text>
      ); })()}
    </svg>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function OwnerLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("owner@nordklip.dk");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) { setError("Indtast en adgangskode."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "400px",
        background: "radial-gradient(ellipse, rgba(184,152,90,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="serif" style={{ fontSize: "32px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.01em" }}>Nordklip</span>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="5" width="10" height="6.5" rx="1.5" stroke="var(--gold)" strokeWidth="1.2"/>
              <path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>Ejersystem</span>
          </div>
        </div>

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderRadius: "14px", padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Adgang til ejeroversigt</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.5 }}>
            Omsætning, teamperformance og bookingdata.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}/>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Adgangskode</label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", cursor: "default", textUnderlineOffset: "2px" }}>Glemt?</span>
              </div>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}/>
              {error && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "5px" }}>{error}</p>}
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: "6px", background: loading ? "var(--surface-2)" : "var(--gold)",
              color: loading ? "var(--text-muted)" : "#0E0C09",
              border: "none", borderRadius: "8px",
              padding: "14px 24px", fontSize: "14px", fontWeight: 700,
              cursor: loading ? "default" : "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/>
                  </svg>
                  Logger ind...
                </>
              ) : "Log ind"}
            </button>
          </form>

          <div style={{
            marginTop: "18px", padding: "11px 14px",
            background: "rgba(184,152,90,0.05)", border: "1px solid rgba(184,152,90,0.15)",
            borderRadius: "8px", display: "flex", gap: "9px", alignItems: "flex-start",
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px", color: "var(--gold)" }}>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5.5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>Demo – </span>
              e-mail er udfyldt. Skriv en vilkårlig adgangskode og tryk log ind.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>
            Ikke ejer? Book en tid i stedet
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function OwnerPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<Period>("Uge");

  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner")) setAuthed(true); } catch {}
    setChecking(false);
  }, []);

  function handleLogin() {
    try {
      sessionStorage.setItem("bf_owner", "1");
      if (!sessionStorage.getItem("bf_session"))
        sessionStorage.setItem("bf_session", JSON.stringify({ name: "Ejer", email: "owner@nordklip.dk" }));
    } catch {}
    setAuthed(true);
  }

  function handleLogout() {
    try { sessionStorage.removeItem("bf_owner"); } catch {}
    setAuthed(false);
  }

  if (checking) return null;
  if (!authed) return <OwnerLogin onLogin={handleLogin}/>;

  const todayDone = TODAY_APTS.filter(a => a.done);
  const todayRem  = TODAY_APTS.filter(a => !a.done);
  const todayRev  = todayDone.reduce((s, a) => s + a.price, 0);
  const totalRev  = TODAY_APTS.reduce((s, a) => s + a.price, 0);
  const meta      = CHART_META[chartPeriod];
  const chartData = CHART_DATA[chartPeriod];

  return (
    <div className="sidebar-wrapper" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <OwnerSidebar onLogout={handleLogout}/>

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid var(--border)",
          background: "rgba(14,12,9,0.8)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <h1 className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Ejeroversigt</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Søndag, 23. marts 2026</p>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* KPI strip */}
          <div className="kpi-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Omsætning i dag",   value: fmtDKK(todayRev), sub: `af ${fmtDKK(totalRev)} muligt`, change: "+12%", up: true },
              { label: "Gennemførte",        value: `${todayDone.length}/${TODAY_APTS.length}`, sub: `${todayRem.length} resterende`, change: "I dag", up: null },
              { label: meta.kpiLabel,        value: fmtDKK(meta.kpiTotal), sub: meta.kpiSub, change: "+8%", up: true },
              { label: "Måned – total",      value: fmtDKK(86440), sub: "Marts 2026", change: "+23%", up: true },
            ].map(({ label, value, sub, change, up }) => (
              <div key={label} style={{
                background: "var(--surface)", border: "1px solid var(--border-strong)",
                borderRadius: "10px", padding: "16px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
                  {up !== null && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      color: up ? "#4ade80" : "#f87171",
                      background: up ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                      border: `1px solid ${up ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                      borderRadius: "4px", padding: "2px 7px",
                    }}>
                      {up ? "+" : "–"} {change}
                    </span>
                  )}
                </div>
                <div className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)", lineHeight: 1, marginBottom: "4px" }}>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Chart + top services */}
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "14px", marginBottom: "14px" }}>
            {/* Chart */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{meta.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{meta.sub}</div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["Uge", "Maaned", "Aar"] as Period[]).map(t => (
                    <button key={t} onClick={() => setChartPeriod(t)} style={{
                      background: chartPeriod === t ? "var(--gold-dim)" : "transparent",
                      border: `1px solid ${chartPeriod === t ? "var(--gold-border)" : "var(--border)"}`,
                      borderRadius: "5px", padding: "4px 10px",
                      fontSize: "11px", fontWeight: chartPeriod === t ? 700 : 400,
                      color: chartPeriod === t ? "var(--gold)" : "var(--text-muted)",
                      cursor: "pointer", transition: "all 0.12s",
                    }}>{PERIOD_LABELS[t]}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "18px 20px 12px" }}>
                <AreaChart data={chartData}/>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  {chartData.map((d, i) => (
                    <span key={d.day} style={{ fontSize: "10px", color: i === chartData.length - 1 ? "var(--gold)" : "var(--text-muted)", fontWeight: i === chartData.length - 1 ? 700 : 400, flex: 1, textAlign: "center" }}>{d.day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top services */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Ydelser</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Omsætning denne måned</div>
              </div>
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "13px" }}>
                {TOP_SERVICES.map(s => (
                  <div key={s.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{s.rev.toLocaleString("da-DK")}</span>
                    </div>
                    <div style={{ height: "3px", background: "var(--surface-2)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: "2px", opacity: 0.65 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's schedule */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden", marginBottom: "14px" }}>
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Dagens program</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{TODAY_APTS.length} aftaler – {fmtDKK(totalRev)}</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "3px 10px", fontWeight: 600 }}>
                  {todayDone.length} gennemført
                </span>
                <span style={{ fontSize: "11px", color: "var(--gold)", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "4px", padding: "3px 10px", fontWeight: 600 }}>
                  {todayRem.length} kommende
                </span>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "70px 1fr 160px 100px 72px 85px 100px",
                padding: "10px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
                minWidth: "680px",
              }}>
                {["Tid", "Kunde", "Ydelse", "Barber", "Min", "Pris", "Status"].map(h => (
                  <div key={h} style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{h}</div>
                ))}
              </div>
              {TODAY_APTS.map((a, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "70px 1fr 160px 100px 72px 85px 100px",
                  padding: "13px 20px", alignItems: "center", minWidth: "680px",
                  borderBottom: i < TODAY_APTS.length - 1 ? "1px solid var(--border)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                  opacity: a.done ? 0.55 : 1,
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{a.time}</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{a.client}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: SVC_COLOR[a.service] || "var(--gold)", flexShrink: 0 }}/>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{a.service}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.barber}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.dur}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: a.done ? "var(--text-muted)" : "var(--gold)" }}>{a.price} kr.</div>
                  <div>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, borderRadius: "4px", padding: "3px 8px",
                      color: a.done ? "#4ade80" : "var(--gold)",
                      background: a.done ? "rgba(74,222,128,0.08)" : "var(--gold-dim)",
                      border: `1px solid ${a.done ? "rgba(74,222,128,0.2)" : "var(--gold-border)"}`,
                    }}>{a.done ? "Færdig" : "Kommende"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo note */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <div style={{
              display: "flex", gap: "8px", alignItems: "center",
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "7px", padding: "9px 16px",
              fontSize: "11px", color: "var(--text-muted)",
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" stroke="var(--text-muted)" strokeWidth="1.2"/>
                <path d="M8 5.5v3.5M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Ejerdemo – </span>I produktion opdateres alt i realtid.</span>
              <span style={{ color: "var(--border-strong)", margin: "0 4px" }}>·</span>
              <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Bygget af Sloth Studio</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
