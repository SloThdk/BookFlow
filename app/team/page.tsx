"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    name: "Marcus",
    fullName: "Marcus Holst",
    role: "Senior Barber",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
    color: "#B8985A",
    pin: "1234",
  },
  {
    name: "Emil",
    fullName: "Emil Strand",
    role: "Barber",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    color: "#7BA3C4",
    pin: "5678",
  },
  {
    name: "Sofia",
    fullName: "Sofia Krag",
    role: "Barber & Farvespecialist",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
    color: "#C49BBF",
    pin: "9012",
  },
];

const MEMBER_PHOTOS: Record<string, string> = Object.fromEntries(TEAM_MEMBERS.map(m => [m.name, m.photo]));
const MEMBER_COLORS: Record<string, string> = Object.fromEntries(TEAM_MEMBERS.map(m => [m.name, m.color]));

const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A",  "Farve & Stil": "#C49BBF",
};

interface Appt {
  time: string; client: string; service: string;
  barber: string; duration: number; notes?: string;
}

const SCHEDULE: Record<number, Appt[]> = {
  "-1": [
    { time: "09:30", client: "Lukas Jensen",      service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Mads Christensen",  service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "10:30", client: "Pernille Holm",     service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { time: "13:00", client: "Simon Koch",        service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "13:30", client: "Nanna Vestergaard", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { time: "14:00", client: "Anders Nielsen",    service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "16:00", client: "Jonas Kjær",        service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "17:00", client: "Thomas Bonde",      service: "Cut & Beard",     barber: "Marcus", duration: 70 },
  ] as Appt[],
  "0": [
    { time: "09:00", client: "Casper Møller",     service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Erik Svendsen",     service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "10:30", client: "Laura Winther",     service: "Farve & Stil",    barber: "Sofia",  duration: 90, notes: "Fuld highlights, lappetest udført" },
    { time: "11:00", client: "Viktor Hansen",     service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "11:30", client: "Frederik Lund",     service: "Cut & Beard",     barber: "Emil",   duration: 70 },
    { time: "13:00", client: "Nikolaj Borg",      service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "13:30", client: "Anna Kristiansen",  service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { time: "14:30", client: "Daniel Westh",      service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "15:30", client: "Sofie Andersen",    service: "Junior Cut",      barber: "Marcus", duration: 30 },
    { time: "16:00", client: "Magnus Brandt",     service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "17:00", client: "Jakob Møller",      service: "Cut & Beard",     barber: "Marcus", duration: 70, notes: "Foretrækker kun saks, ingen maskine" },
  ] as Appt[],
  "1": [
    { time: "09:30", client: "Mikkel Dahl",       service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Rasmus Holm",       service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "11:00", client: "Camilla Voss",      service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { time: "13:00", client: "Bjarne Kjeldsen",   service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "14:00", client: "Lise Friis",        service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { time: "15:30", client: "Adam Schäfer",      service: "Cut & Beard",     barber: "Emil",   duration: 70 },
    { time: "17:00", client: "Jesper Winther",    service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ] as Appt[],
};

const WORK_HOURS: Record<string, Record<string, string>> = {
  "Marcus": { "Man": "09:00–17:30", "Tir": "09:00–17:30", "Ons": "09:00–17:30", "Tor": "09:00–17:30", "Fre": "09:00–17:30", "Lør": "10:00–15:00", "Søn": "Fri" },
  "Emil":   { "Man": "09:00–17:30", "Tir": "09:00–17:30", "Ons": "11:00–19:30", "Tor": "11:00–19:30", "Fre": "09:00–17:30", "Lør": "10:00–15:00", "Søn": "Fri" },
  "Sofia":  { "Man": "10:00–18:30", "Tir": "10:00–18:30", "Ons": "10:00–18:30", "Tor": "10:00–18:30", "Fre": "10:00–18:30", "Lør": "10:00–16:00", "Søn": "Fri" },
};

function getToday(): string {
  const d = new Date();
  return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });
}

function getNowStr() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
}

// ─── Team Login ───────────────────────────────────────────────────────────────
function TeamLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!pin.trim()) { setError("Indtast en pinkode."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(selected); }, 700);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(74,222,128,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", fontWeight: 700, color: "var(--text)" }}>Nordklip</span>
          </Link>
          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "3px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }}/>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80" }}>Team Portal</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "14px", padding: "32px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <h1 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Log ind som medarbejder</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>Vælg dit navn og indtast din pinkode.</p>

          {/* Barber picker */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {TEAM_MEMBERS.map(m => (
              <button key={m.name} onClick={() => { setSelected(m.name); setError(""); }} style={{
                flex: 1, padding: "12px 8px", borderRadius: "10px", cursor: "pointer",
                background: selected === m.name ? `${m.color}14` : "var(--surface-2)",
                border: `1px solid ${selected === m.name ? m.color + "44" : "var(--border-strong)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.12s",
              }}>
                <img src={m.photo} alt={m.name} style={{
                  width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover",
                  border: `2px solid ${selected === m.name ? m.color : "var(--border-strong)"}`,
                  opacity: selected === m.name ? 1 : 0.6, transition: "all 0.12s",
                }}/>
                <span style={{ fontSize: "12px", fontWeight: selected === m.name ? 700 : 500, color: selected === m.name ? "var(--text)" : "var(--text-muted)" }}>{m.name}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "7px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pinkode</label>
              <input type="password" placeholder="••••" value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                style={{ letterSpacing: "0.3em", fontSize: "18px" }}/>
              {error && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "5px" }}>{error}</p>}
            </div>
            <button type="submit" disabled={loading || !selected} style={{
              background: loading || !selected ? "var(--surface-2)" : "#4ade80",
              color: loading || !selected ? "var(--text-muted)" : "#0A0A0A",
              border: "none", borderRadius: "8px", padding: "13px 24px",
              fontSize: "14px", fontWeight: 700,
              cursor: loading || !selected ? "default" : "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              {loading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/>
                  </svg>
                  Logger ind...
                </>
              ) : "Log ind"}
            </button>
          </form>

          <div style={{ marginTop: "16px", padding: "10px 12px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
              <span style={{ color: "#4ade80", fontWeight: 600 }}>Demo — </span>
              vælg et navn og skriv en vilkårlig pinkode.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>
            Ikke medarbejder? Book en tid →
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Appointment Row (team-safe — no prices) ──────────────────────────────────
function ApptRow({ appt, isMe, isPast }: { appt: Appt; isMe: boolean; isPast: boolean }) {
  const [open, setOpen] = useState(false);
  const color = SVC_COLOR[appt.service] || "#B8985A";
  const memberColor = MEMBER_COLORS[appt.barber] || "var(--gold)";

  return (
    <div style={{
      background: isMe ? `${memberColor}0A` : "var(--surface)",
      border: `1px solid ${isMe ? memberColor + "33" : "var(--border-strong)"}`,
      borderRadius: "8px", overflow: "hidden", opacity: isPast ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", cursor: appt.notes ? "pointer" : "default" }}
        onClick={() => appt.notes && setOpen(o => !o)}>
        {/* Time */}
        <div style={{
          width: "68px", flexShrink: 0, borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "13px 8px", background: "rgba(0,0,0,0.15)", gap: "2px",
        }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: isPast ? "var(--text-muted)" : "var(--text)" }}>{appt.time}</span>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 500 }}>{appt.duration} min</span>
        </div>

        {/* Service + client */}
        <div style={{ flex: 1, padding: "12px 16px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }}/>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{appt.service}</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{appt.client}</span>
          {appt.notes && (
            <div style={{ marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v7H2z" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="var(--text-muted)" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="var(--text-muted)" strokeWidth="1.1"/></svg>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>Bemærkning</span>
            </div>
          )}
        </div>

        {/* Barber badge */}
        <div style={{ padding: "12px 14px", borderLeft: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={MEMBER_PHOTOS[appt.barber]} alt={appt.barber} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${memberColor}55` }}/>
          <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? memberColor : "var(--text-muted)" }}>{appt.barber}</span>
        </div>
      </div>

      {/* Notes expand */}
      {open && appt.notes && (
        <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border)", background: "rgba(184,152,90,0.04)", display: "flex", gap: "8px" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px", color: "var(--gold)" }}><path d="M2 2h8v7H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1.1"/></svg>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Team Dashboard ───────────────────────────────────────────────────────────
function TeamDashboard({ memberName, onLogout }: { memberName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"min" | "team" | "timer">("min");
  const member = TEAM_MEMBERS.find(m => m.name === memberName)!;

  const now    = getNowStr();
  const today  = (SCHEDULE[0] ?? []).sort((a, b) => a.time.localeCompare(b.time));
  const myDay  = today.filter(a => a.barber === memberName);
  const isPast = (t: string) => t < now;
  const todayLabel = getToday();

  const myNextAppt = myDay.find(a => !isPast(a.time));
  const myDone = myDay.filter(a => isPast(a.time)).length;
  const myLeft = myDay.length - myDone;

  const tabs = [
    { key: "min"   as const, label: "Min dag" },
    { key: "team"  as const, label: "Hele teamet" },
    { key: "timer" as const, label: "Mine timer" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Topnav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 28px", height: "58px", gap: "20px",
      }}>
        {/* Logo */}
        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>Nordklip</span>
        <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "2px 8px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80" }}>Team</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2px", marginLeft: "12px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "6px 14px", borderRadius: "6px", background: "transparent", border: "none",
              fontSize: "13px", fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "var(--text)" : "var(--text-muted)",
              borderBottom: tab === t.key ? `2px solid ${member.color}` : "2px solid transparent",
              cursor: "pointer", transition: "all 0.12s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src={member.photo} alt={member.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${member.color}55` }}/>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{member.fullName}</span>
          </div>
          <button onClick={onLogout} style={{
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 500,
            color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 7h8M10 4.5L12.5 7 10 9.5M5.5 3H2V11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Log ud
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: "860px", margin: "0 auto", width: "100%", padding: "28px 24px 80px" }}>

        {/* ── MIN DAG ── */}
        {tab === "min" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>
                God dag, {memberName}
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{todayLabel}</p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              {[
                { label: "Aftaler i dag", val: myDay.length },
                { label: "Gennemført",    val: myDone },
                { label: "Tilbage",       val: myLeft },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  flex: 1, background: "var(--surface)", border: "1px solid var(--border-strong)",
                  borderRadius: "9px", padding: "14px 16px",
                }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: member.color, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                </div>
              ))}
              {myNextAppt && (
                <div style={{
                  flex: 2, background: `${member.color}0D`, border: `1px solid ${member.color}33`,
                  borderRadius: "9px", padding: "14px 16px",
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>Næste aftale</div>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{myNextAppt.time} · {myNextAppt.client}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{myNextAppt.service} · {myNextAppt.duration} min</div>
                </div>
              )}
            </div>

            {/* My appointments */}
            {myDay.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px" }}>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Ingen aftaler i dag.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {myDay.map((a, i) => (
                  <ApptRow key={i} appt={a} isMe={true} isPast={isPast(a.time)}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HELE TEAMET ── */}
        {tab === "team" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Hele teamet</h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{todayLabel} · {today.length} aftaler i dag</p>
            </div>

            {TEAM_MEMBERS.map(m => {
              const barberApts = today.filter(a => a.barber === m.name);
              return (
                <div key={m.name} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <img src={m.photo} alt={m.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${m.color}44` }}/>
                    <div>
                      <span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>{m.fullName}</span>
                      <span style={{ fontSize: "11px", color: m.color, marginLeft: "8px" }}>{m.role}</span>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "4px", padding: "2px 8px" }}>
                      {barberApts.length} aftaler
                    </span>
                  </div>
                  {barberApts.length === 0 ? (
                    <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Ingen aftaler i dag.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {barberApts.map((a, i) => (
                        <ApptRow key={i} appt={a} isMe={a.barber === memberName} isPast={isPast(a.time)}/>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MINE TIMER ── */}
        {tab === "timer" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Mine arbejdstider</h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{member.fullName} · {member.role}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Weekly schedule */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Ugeskema</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Faste arbejdstider</div>
                </div>
                <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {Object.entries(WORK_HOURS[memberName] || {}).map(([day, hours]) => {
                    const isFri = hours === "Fri";
                    const isToday = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day;
                    return (
                      <div key={day} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 12px", borderRadius: "6px",
                        background: isToday ? `${member.color}10` : isFri ? "transparent" : "var(--surface-2)",
                        border: `1px solid ${isToday ? member.color + "33" : "transparent"}`,
                      }}>
                        <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : 400, color: isToday ? member.color : isFri ? "var(--text-muted)" : "var(--text-secondary)", minWidth: "36px" }}>{day}</span>
                        <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : isFri ? 400 : 600, color: isToday ? "var(--text)" : isFri ? "var(--text-muted)" : "var(--text-secondary)" }}>{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Colleagues schedule */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Kollegernes tider</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Ugentlige arbejdstider</div>
                </div>
                <div style={{ padding: "12px 20px" }}>
                  {TEAM_MEMBERS.filter(m => m.name !== memberName).map(col => (
                    <div key={col.name} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <img src={col.photo} alt={col.name} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}/>
                        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{col.fullName}</span>
                        <span style={{ fontSize: "10px", color: col.color, fontWeight: 600 }}>{col.role}</span>
                      </div>
                      {Object.entries(WORK_HOURS[col.name] || {}).map(([day, hours]) => (
                        <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", minWidth: "30px" }}>{day}</span>
                          <span style={{ fontSize: "11px", color: hours === "Fri" ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: hours === "Fri" ? 400 : 500 }}>{hours}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
        <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
        <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Bygget af Sloth Studio</a>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [member, setMember]   = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bf_team");
      if (saved) setMember(saved);
    } catch {}
    setChecking(false);
  }, []);

  function handleLogin(name: string) {
    try { sessionStorage.setItem("bf_team", name); } catch {}
    setMember(name);
  }

  function handleLogout() {
    try { sessionStorage.removeItem("bf_team"); } catch {}
    setMember(null);
  }

  if (checking) return null;
  if (!member) return <TeamLogin onLogin={handleLogin}/>;
  return <TeamDashboard memberName={member} onLogout={handleLogout}/>;
}
