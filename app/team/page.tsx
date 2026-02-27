"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: "Marcus", fullName: "Marcus Holst", role: "Senior Barber",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
    color: "#B8985A" },
  { name: "Emil", fullName: "Emil Strand", role: "Barber",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    color: "#7BA3C4" },
  { name: "Sofia", fullName: "Sofia Krag", role: "Barber & Farvespecialist",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
    color: "#C49BBF" },
];

const MEMBER_MAP = Object.fromEntries(TEAM_MEMBERS.map(m => [m.name, m]));

const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A",  "Farve & Stil": "#C49BBF",
};

interface Appt { time: string; client: string; service: string; barber: string; duration: number; notes?: string; }
interface Msg   { id: string; sender: string; text: string; ts: number; }
interface Swap  { id: string; barber: string; time: string; service: string; client: string; duration: number; note: string; ts: number; claimed?: string; }

const TODAY_SCHEDULE: Appt[] = [
  { time: "09:00", client: "Casper Møller",    service: "Classic Cut",     barber: "Marcus", duration: 45 },
  { time: "10:00", client: "Erik Svendsen",    service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
  { time: "10:30", client: "Laura Winther",    service: "Farve & Stil",    barber: "Sofia",  duration: 90, notes: "Fuld highlights, lappetest udført" },
  { time: "11:00", client: "Viktor Hansen",    service: "Classic Cut",     barber: "Marcus", duration: 45 },
  { time: "11:30", client: "Frederik Lund",    service: "Cut & Beard",     barber: "Emil",   duration: 70 },
  { time: "13:00", client: "Nikolaj Borg",     service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
  { time: "13:30", client: "Anna Kristiansen", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
  { time: "14:30", client: "Daniel Westh",     service: "Classic Cut",     barber: "Emil",   duration: 45 },
  { time: "15:30", client: "Sofie Andersen",   service: "Junior Cut",      barber: "Marcus", duration: 30 },
  { time: "16:00", client: "Magnus Brandt",    service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
  { time: "17:00", client: "Jakob Møller",     service: "Cut & Beard",     barber: "Marcus", duration: 70, notes: "Foretrækker kun saks, ingen maskine" },
];

const WORK_HOURS: Record<string, Record<string, string>> = {
  Marcus: { Man: "09:00–17:30", Tir: "09:00–17:30", Ons: "09:00–17:30", Tor: "09:00–17:30", Fre: "09:00–17:30", Lør: "10:00–15:00", Søn: "Fri" },
  Emil:   { Man: "09:00–17:30", Tir: "09:00–17:30", Ons: "11:00–19:30", Tor: "11:00–19:30", Fre: "09:00–17:30", Lør: "10:00–15:00", Søn: "Fri" },
  Sofia:  { Man: "10:00–18:30", Tir: "10:00–18:30", Ons: "10:00–18:30", Tor: "10:00–18:30", Fre: "10:00–18:30", Lør: "10:00–16:00", Søn: "Fri" },
};

function getNow() { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; }
function getToday() { return new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" }); }
function timeFmt(ts: number) { return new Date(ts).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }); }
function uid() { return Math.random().toString(36).slice(2); }

const LS_MSG  = "bf_team_messages";
const LS_SWAP = "bf_team_swaps";

function loadLS<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Login ────────────────────────────────────────────────────────────────────
function TeamLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !pin.trim()) { setErr("Vælg navn og skriv en pinkode."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(selected); }, 700);
  }
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(74,222,128,0.04) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", fontWeight: 700, color: "var(--text)" }}>Nordklip</span>
          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "3px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }}/>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4ade80" }}>Team Portal</span>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "14px", padding: "32px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <h1 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Log ind som medarbejder</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>Vælg dit navn og indtast din pinkode.</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {TEAM_MEMBERS.map(m => (
              <button key={m.name} onClick={() => { setSelected(m.name); setErr(""); }} style={{
                flex: 1, padding: "12px 8px", borderRadius: "10px", cursor: "pointer",
                background: selected === m.name ? `${m.color}14` : "var(--surface-2)",
                border: `1px solid ${selected === m.name ? m.color + "44" : "var(--border-strong)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.12s",
              }}>
                <img src={m.photo} alt={m.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${selected === m.name ? m.color : "var(--border-strong)"}`, opacity: selected === m.name ? 1 : 0.6 }}/>
                <span style={{ fontSize: "12px", fontWeight: selected === m.name ? 700 : 500, color: selected === m.name ? "var(--text)" : "var(--text-muted)" }}>{m.name}</span>
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "7px", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Pinkode</label>
              <input type="password" placeholder="••••" value={pin} onChange={e => { setPin(e.target.value); setErr(""); }} style={{ letterSpacing: "0.3em", fontSize: "18px" }}/>
              {err && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "5px" }}>{err}</p>}
            </div>
            <button type="submit" disabled={loading || !selected} style={{
              background: loading || !selected ? "var(--surface-2)" : "#4ade80",
              color: loading || !selected ? "var(--text-muted)" : "#0A0A0A",
              border: "none", borderRadius: "8px", padding: "13px 24px", fontSize: "14px", fontWeight: 700,
              cursor: loading || !selected ? "default" : "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              {loading ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg>Logger ind...</> : "Log ind"}
            </button>
          </form>
          <div style={{ marginTop: "16px", padding: "10px 12px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
              <span style={{ color: "#4ade80", fontWeight: 600 }}>Demo — </span>vælg et navn og skriv en vilkårlig pinkode.
            </p>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>Ikke medarbejder? Book en tid →</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── ApptRow ──────────────────────────────────────────────────────────────────
function ApptRow({ appt, isMe, isPast, onOfferSwap }: { appt: Appt; isMe: boolean; isPast: boolean; onOfferSwap?: () => void; }) {
  const [open, setOpen] = useState(false);
  const color = SVC_COLOR[appt.service] || "#B8985A";
  const mc = MEMBER_MAP[appt.barber]?.color || "var(--gold)";
  return (
    <div style={{ background: isMe ? `${mc}0A` : "var(--surface)", border: `1px solid ${isMe ? mc + "33" : "var(--border-strong)"}`, borderRadius: "8px", overflow: "hidden", opacity: isPast ? 0.45 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", cursor: appt.notes ? "pointer" : "default" }} onClick={() => appt.notes && setOpen(o => !o)}>
        <div style={{ width: "68px", flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "13px 8px", background: "rgba(0,0,0,0.15)", gap: "2px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: isPast ? "var(--text-muted)" : "var(--text)" }}>{appt.time}</span>
          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{appt.duration} min</span>
        </div>
        <div style={{ flex: 1, padding: "12px 16px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }}/>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{appt.service}</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{appt.client}</span>
          {appt.notes && <div style={{ marginTop: "2px", fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>Bemærkning</div>}
        </div>
        <div style={{ padding: "12px 14px", borderLeft: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={MEMBER_MAP[appt.barber]?.photo} alt={appt.barber} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${mc}55` }}/>
          <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? mc : "var(--text-muted)" }}>{appt.barber}</span>
        </div>
        {isMe && !isPast && onOfferSwap && (
          <button onClick={e => { e.stopPropagation(); onOfferSwap(); }} style={{
            margin: "8px 12px 8px 0", background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", padding: "5px 10px", fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>Tilbyd byt</button>
        )}
      </div>
      {open && appt.notes && (
        <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border)", background: "rgba(184,152,90,0.04)", display: "flex", gap: "8px" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px", color: "var(--gold)" }}><path d="M2 2h8v7H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1.1"/></svg>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Swap Offer Modal ─────────────────────────────────────────────────────────
function SwapModal({ appt, onClose, onConfirm }: { appt: Appt; onClose: () => void; onConfirm: (note: string) => void; }) {
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "14px", width: "100%", maxWidth: "420px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Tilbyd vagtbyt</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "20px" }}>{appt.service} · {appt.time} · {appt.client}</div>
        <div>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "8px" }}>Besked til kolleger (valgfri)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="F.eks. 'Kan nogen tage min tur kl. 13:00? Tandlæge'" style={{ width: "100%", minHeight: "80px", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 12px", resize: "vertical", boxSizing: "border-box" as const }}/>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Annuller</button>
          <button onClick={() => onConfirm(note)} style={{ flex: 2, padding: "11px", background: "#4ade80", border: "none", borderRadius: "8px", color: "#0A0A0A", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Send vagtbyt-forespørgsel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function TeamDashboard({ memberName, onLogout }: { memberName: string; onLogout: () => void }) {
  type Tab = "min" | "team" | "timer" | "chat";
  const [tab, setTab]     = useState<Tab>("min");
  const [msgs, setMsgs]   = useState<Msg[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [newMsg, setNewMsg]   = useState("");
  const [swapTarget, setSwapTarget] = useState<Appt | null>(null);
  const [unread, setUnread]   = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const member = MEMBER_MAP[memberName]!;

  // Load from localStorage
  useEffect(() => {
    setMsgs(loadLS<Msg[]>(LS_MSG, []));
    setSwaps(loadLS<Swap[]>(LS_SWAP, []));
  }, []);

  // Unread badge
  useEffect(() => {
    if (tab !== "chat") {
      const lastRead = parseInt(localStorage.getItem("bf_team_lastread_" + memberName) || "0");
      const unreadCount = msgs.filter(m => m.ts > lastRead && m.sender !== memberName).length;
      setUnread(unreadCount);
    } else {
      localStorage.setItem("bf_team_lastread_" + memberName, Date.now().toString());
      setUnread(0);
    }
  }, [msgs, tab, memberName]);

  // Auto-scroll chat
  useEffect(() => {
    if (tab === "chat" && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [tab, msgs]);

  function sendMsg() {
    if (!newMsg.trim()) return;
    const m: Msg = { id: uid(), sender: memberName, text: newMsg.trim(), ts: Date.now() };
    const updated = [...msgs, m];
    setMsgs(updated); saveLS(LS_MSG, updated); setNewMsg("");
  }

  function offerSwap(appt: Appt, note: string) {
    const s: Swap = { id: uid(), barber: memberName, time: appt.time, service: appt.service, client: appt.client, duration: appt.duration, note, ts: Date.now() };
    const updated = [...swaps, s]; setSwaps(updated); saveLS(LS_SWAP, updated); setSwapTarget(null);
    // Auto-post to chat
    const chatMsg: Msg = { id: uid(), sender: memberName, text: `Tilbyder vagtbyt: ${appt.service} kl. ${appt.time} (${appt.client})${note ? " — " + note : ""}`, ts: Date.now() + 1 };
    const updatedMsgs = [...msgs, chatMsg]; setMsgs(updatedMsgs); saveLS(LS_MSG, updatedMsgs);
  }

  function claimSwap(swapId: string) {
    const updated = swaps.map(s => s.id === swapId ? { ...s, claimed: memberName } : s);
    setSwaps(updated); saveLS(LS_SWAP, updated);
    const s = swaps.find(x => x.id === swapId)!;
    const chatMsg: Msg = { id: uid(), sender: memberName, text: `Accepterer vagtbyt: ${s.service} kl. ${s.time} fra ${s.barber}`, ts: Date.now() };
    const updatedMsgs = [...msgs, chatMsg]; setMsgs(updatedMsgs); saveLS(LS_MSG, updatedMsgs);
  }

  const now = getNow();
  const today = TODAY_SCHEDULE.sort((a, b) => a.time.localeCompare(b.time));
  const myDay = today.filter(a => a.barber === memberName);
  const isPast = (t: string) => t < now;
  const myNext = myDay.find(a => !isPast(a.time));
  const openSwaps = swaps.filter(s => !s.claimed && s.barber !== memberName);

  const tabs: { key: Tab; label: string }[] = [
    { key: "min",   label: "Min dag" },
    { key: "team",  label: "Hele teamet" },
    { key: "timer", label: "Mine timer" },
    { key: "chat",  label: "Beskeder" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Topnav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", height: "58px", gap: "16px" }}>
        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>Nordklip</span>
        <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "2px 8px", flexShrink: 0 }}>
          <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4ade80" }}>Team</span>
        </div>
        <div style={{ display: "flex", gap: "2px", marginLeft: "8px", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "6px 14px", borderRadius: "6px", background: "transparent", border: "none",
              fontSize: "13px", fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "var(--text)" : "var(--text-muted)",
              borderBottom: tab === t.key ? `2px solid ${member.color}` : "2px solid transparent",
              cursor: "pointer", transition: "all 0.12s", flexShrink: 0, position: "relative",
            }}>
              {t.label}
              {t.key === "chat" && unread > 0 && (
                <span style={{ position: "absolute", top: "2px", right: "2px", width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }}/>
              )}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <img src={member.photo} alt={member.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${member.color}55` }}/>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{member.fullName}</span>
          <button onClick={onLogout} style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 7h8M10 4.5L12.5 7 10 9.5M5.5 3H2V11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Log ud
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: tab === "chat" ? "700px" : "860px", margin: "0 auto", width: "100%", padding: tab === "chat" ? "0" : "28px 24px 80px", display: tab === "chat" ? "flex" : "block", flexDirection: "column" }}>

        {/* ── MIN DAG ── */}
        {tab === "min" && (
          <div>
            <div style={{ marginBottom: "22px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>God dag, {memberName}</h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{getToday()}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "22px", flexWrap: "wrap" }}>
              {[{ label: "Aftaler", val: myDay.length }, { label: "Gennemført", val: myDay.filter(a => isPast(a.time)).length }, { label: "Tilbage", val: myDay.filter(a => !isPast(a.time)).length }].map(({ label, val }) => (
                <div key={label} style={{ flex: 1, minWidth: "80px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "9px", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: member.color, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                </div>
              ))}
              {myNext && (
                <div style={{ flex: 2, minWidth: "160px", background: `${member.color}0D`, border: `1px solid ${member.color}33`, borderRadius: "9px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "4px" }}>Næste aftale</div>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{myNext.time} · {myNext.client}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{myNext.service} · {myNext.duration} min</div>
                </div>
              )}
            </div>
            {/* Open swap requests */}
            {openSwaps.length > 0 && (
              <div style={{ marginBottom: "20px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: "9px", padding: "14px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "10px" }}>Vagter til byt fra kolleger</div>
                {openSwaps.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid rgba(74,222,128,0.1)" }}>
                    <img src={MEMBER_MAP[s.barber]?.photo} alt={s.barber} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{s.barber}: {s.service} kl. {s.time} ({s.client})</div>
                      {s.note && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{s.note}</div>}
                    </div>
                    <button onClick={() => claimSwap(s.id)} style={{ background: "#4ade8020", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, color: "#4ade80", cursor: "pointer", flexShrink: 0 }}>Accepter byt</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {myDay.length === 0
                ? <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px" }}><p style={{ color: "var(--text-muted)" }}>Ingen aftaler i dag.</p></div>
                : myDay.map((a, i) => <ApptRow key={i} appt={a} isMe={true} isPast={isPast(a.time)} onOfferSwap={() => setSwapTarget(a)}/>)
              }
            </div>
          </div>
        )}

        {/* ── HELE TEAMET ── */}
        {tab === "team" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Hele teamet</h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{getToday()} · {today.length} aftaler</p>
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
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "4px", padding: "2px 8px" }}>{barberApts.length} aftaler</span>
                  </div>
                  {barberApts.length === 0
                    ? <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px" }}><p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Ingen aftaler i dag.</p></div>
                    : <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{barberApts.map((a, i) => <ApptRow key={i} appt={a} isMe={a.barber === memberName} isPast={isPast(a.time)}/>)}</div>
                  }
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
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Ugeskema</div>
                </div>
                <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {Object.entries(WORK_HOURS[memberName] || {}).map(([day, hours]) => {
                    const isFri = hours === "Fri";
                    const todayDow = ["Søn","Man","Tir","Ons","Tor","Fre","Lør"][new Date().getDay()];
                    const isToday = day === todayDow;
                    return (
                      <div key={day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: "6px", background: isToday ? `${member.color}10` : isFri ? "transparent" : "var(--surface-2)", border: `1px solid ${isToday ? member.color + "33" : "transparent"}` }}>
                        <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : 400, color: isToday ? member.color : isFri ? "var(--text-muted)" : "var(--text-secondary)", minWidth: "36px" }}>{day}</span>
                        <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : isFri ? 400 : 600, color: isToday ? "var(--text)" : isFri ? "var(--text-muted)" : "var(--text-secondary)" }}>{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Kollegernes tider</div>
                </div>
                <div style={{ padding: "12px 20px" }}>
                  {TEAM_MEMBERS.filter(m => m.name !== memberName).map(col => (
                    <div key={col.name} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <img src={col.photo} alt={col.name} style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}/>
                        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{col.name}</span>
                        <span style={{ fontSize: "10px", color: col.color, fontWeight: 600 }}>{col.role}</span>
                      </div>
                      {Object.entries(WORK_HOURS[col.name] || {}).map(([day, hrs]) => (
                        <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", minWidth: "30px" }}>{day}</span>
                          <span style={{ fontSize: "11px", color: hrs === "Fri" ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: hrs === "Fri" ? 400 : 500 }}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BESKEDER / CHAT ── */}
        {tab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "calc(100vh - 58px)" }}>
            {/* Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Teamchat</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {TEAM_MEMBERS.map(m => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <img src={m.photo} alt={m.name} style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${m.color}55` }}/>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {msgs.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>Ingen beskeder endnu. Skriv noget til teamet!</p>
                </div>
              )}
              {msgs.map(m => {
                const isMe = m.sender === memberName;
                const sender = MEMBER_MAP[m.sender];
                return (
                  <div key={m.id} style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                    <img src={sender?.photo} alt={m.sender} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${sender?.color}55` }}/>
                    <div style={{ maxWidth: "70%" }}>
                      {!isMe && <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>{m.sender} · {timeFmt(m.ts)}</div>}
                      <div style={{
                        padding: "10px 14px", borderRadius: "12px",
                        background: isMe ? `${member.color}20` : "var(--surface)",
                        border: `1px solid ${isMe ? member.color + "44" : "var(--border-strong)"}`,
                        fontSize: "13px", color: "var(--text)", lineHeight: 1.5,
                        borderBottomRightRadius: isMe ? "4px" : "12px",
                        borderBottomLeftRadius: isMe ? "12px" : "4px",
                      }}>{m.text}</div>
                      {isMe && <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "right", marginTop: "3px" }}>{timeFmt(m.ts)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                placeholder={`Skriv til teamet som ${memberName}...`}
                rows={1}
                style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 14px", resize: "none", outline: "none", lineHeight: 1.5 }}
              />
              <button onClick={sendMsg} disabled={!newMsg.trim()} style={{
                background: newMsg.trim() ? member.color : "var(--surface-2)",
                border: `1px solid ${newMsg.trim() ? "transparent" : "var(--border-strong)"}`,
                borderRadius: "8px", padding: "10px 16px", cursor: newMsg.trim() ? "pointer" : "default",
                color: newMsg.trim() ? "#0A0A0A" : "var(--text-muted)", fontWeight: 700, fontSize: "13px", transition: "all 0.12s", flexShrink: 0,
              }}>Send</button>
            </div>
          </div>
        )}
      </div>

      {tab !== "chat" && (
        <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Bygget af Sloth Studio</a>
        </div>
      )}

      {swapTarget && <SwapModal appt={swapTarget} onClose={() => setSwapTarget(null)} onConfirm={note => offerSwap(swapTarget, note)}/>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [member, setMember]     = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    try { const s = sessionStorage.getItem("bf_team"); if (s) setMember(s); } catch {}
    setChecking(false);
  }, []);
  function handleLogin(name: string) { try { sessionStorage.setItem("bf_team", name); } catch {} setMember(name); }
  function handleLogout() { try { sessionStorage.removeItem("bf_team"); } catch {} setMember(null); }
  if (checking) return null;
  if (!member) return <TeamLogin onLogin={handleLogin}/>;
  return <TeamDashboard memberName={member} onLogout={handleLogout}/>;
}
