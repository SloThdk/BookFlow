"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Appt { id: string; time: string; client: string; service: string; barber: string; duration: number; notes?: string; }
interface Msg  { id: string; sender: string; text: string; ts: number; attachment?: { name: string; size: string; type: "image"|"file" }; }
interface Swap { id: string; barber: string; apptId: string; time: string; service: string; client: string; duration: number; targetBarber: string; note: string; ts: number; claimedBy?: string; }

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const TEAM = [
  { name: "Marcus", fullName: "Marcus Holst",   role: "Senior Barber",           color: "#B8985A", online: true,
    photo: "https://images.pexels.com/photos/30004312/pexels-photo-30004312.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" },
  { name: "Emil",   fullName: "Emil Strand",    role: "Barber",                  color: "#7BA3C4", online: false,
    photo: "https://images.pexels.com/photos/30004318/pexels-photo-30004318.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" },
  { name: "Sofia",  fullName: "Sofia Krag",     role: "Barber & Farvespecialist", color: "#C49BBF", online: true,
    photo: "https://images.pexels.com/photos/30004322/pexels-photo-30004322.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" },
] as const;

const MANAGER = { name: "Manager", fullName: "Lars (Ejer)", role: "Ejer", color: "#B8985A", online: true,
  photo: "https://images.pexels.com/photos/35129364/pexels-photo-35129364.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" };

type MemberName = "Marcus" | "Emil" | "Sofia";
const MEMBER = Object.fromEntries(TEAM.map(m => [m.name, m])) as Record<MemberName, typeof TEAM[number]>;

const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4", "Cut & Beard": "#C4977A",
  "Hot Towel Shave": "#7BBFA5", "Junior Cut": "#A0B89A", "Farve & Stil": "#C49BBF",
};

const SCHEDULE_BASE: Appt[] = [
  { id:"a1", time:"09:00", client:"Casper Moeller",   service:"Classic Cut",     barber:"Marcus", duration:45 },
  { id:"a2", time:"10:00", client:"Erik Svendsen",    service:"Beard Sculpt",    barber:"Emil",   duration:30 },
  { id:"a3", time:"10:30", client:"Laura Winther",    service:"Farve & Stil",    barber:"Sofia",  duration:90, notes:"Fuld highlights, lappetest udfoert" },
  { id:"a4", time:"11:00", client:"Viktor Hansen",    service:"Classic Cut",     barber:"Marcus", duration:45 },
  { id:"a5", time:"11:30", client:"Frederik Lund",    service:"Cut & Beard",     barber:"Emil",   duration:70 },
  { id:"a6", time:"13:00", client:"Nikolaj Borg",     service:"Hot Towel Shave", barber:"Marcus", duration:40 },
  { id:"a7", time:"13:30", client:"Anna Kristiansen", service:"Farve & Stil",    barber:"Sofia",  duration:90 },
  { id:"a8", time:"14:30", client:"Daniel Westh",     service:"Classic Cut",     barber:"Emil",   duration:45 },
  { id:"a9", time:"15:30", client:"Sofie Andersen",   service:"Junior Cut",      barber:"Marcus", duration:30 },
  { id:"a10",time:"16:00", client:"Magnus Brandt",    service:"Beard Sculpt",    barber:"Emil",   duration:30 },
  { id:"a11",time:"17:00", client:"Jakob Moeller",    service:"Cut & Beard",     barber:"Marcus", duration:70, notes:"Foretraekker kun saks, ingen maskine" },
];

const WORK_HOURS: Record<string, Record<string, string>> = {
  Marcus: { Man:"09:00-17:30", Tir:"09:00-17:30", Ons:"09:00-17:30", Tor:"09:00-17:30", Fre:"09:00-17:30", "Loer":"10:00-15:00", "Soen":"Fri" },
  Emil:   { Man:"09:00-17:30", Tir:"09:00-17:30", Ons:"11:00-19:30", Tor:"11:00-19:30", Fre:"09:00-17:30", "Loer":"10:00-15:00", "Soen":"Fri" },
  Sofia:  { Man:"10:00-18:30", Tir:"10:00-18:30", Ons:"10:00-18:30", Tor:"10:00-18:30", Fre:"10:00-18:30", "Loer":"10:00-16:00", "Soen":"Fri" },
};

const DAY_LABELS: Record<string, string> = { Man:"Mandag", Tir:"Tirsdag", Ons:"Onsdag", Tor:"Torsdag", Fre:"Fredag", "Loer":"Loerdag", "Soen":"Soendag" };

/* Simulated seed messages */
function getSeedMessages(myName: string): Record<string, Msg[]> {
  const now = Date.now();
  const seeds: Record<string, Msg[]> = {};

  /* "Alle" channel — manager announcement */
  const allKey = "bf_chat_all";
  seeds[allKey] = [
    { id:"seed1", sender:"Manager", text:"Hej alle -- vi har faaet nye Wahl Legend clippers ind. De ligger i skuffen under station 2. Husk at rengoere bladene efter hver kunde. Derudover: vi lukker en time tidligere naeste fredag pga. maling af facaden. God arbejdslyst!", ts: now - 3600000 },
    { id:"seed2", sender:"Marcus", text:"Fedt, de gamle var ved at vaere slidte. Tak for opdateringen.", ts: now - 3200000 },
    { id:"seed3", sender:"Sofia", text:"Noteret med fredagen. Skal jeg flytte mine sene aftaler?", ts: now - 2800000 },
  ];

  /* DM seeds — from each barber */
  const others = TEAM.filter(m => m.name !== myName);
  others.forEach(m => {
    const k = chatKeyFn(myName, m.name);
    if (m.name === "Marcus") {
      seeds[k] = [{ id:"seedm1", sender:"Marcus", text:"Har du set den nye pomade fra Layrite? Kunden i morges var vild med den. Vi burde bestille mere.", ts: now - 1800000 }];
    } else if (m.name === "Emil") {
      seeds[k] = [{ id:"seede1", sender:"Emil", text:"Er der nogen der har en ekstra kappe? Min er i vask og jeg har en kunde om 20 min.", ts: now - 900000 }];
    } else if (m.name === "Sofia") {
      seeds[k] = [{ id:"seeds1", sender:"Sofia", text:"Kan en af jer tage min 15:30? Jeg har en tandlaegetid jeg glemte at aflyse.", ts: now - 1200000 }];
    }
  });

  /* Manager DM */
  const mk = chatKeyFn(myName, "Manager");
  seeds[mk] = [{ id:"seedmgr1", sender:"Manager", text:"Hej " + myName + " -- husk at opdatere din profil med det nye foto naar du faar tid. Vi opdaterer hjemmesiden snart.", ts: now - 7200000 }];

  return seeds;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function chatKeyFn(a: string, b: string) {
  if (b === "all") return "bf_chat_all";
  if (a === "all") return "bf_chat_all";
  if (b === "Manager") return `bf_dm_${a.toLowerCase()}_manager`;
  if (a === "Manager") return `bf_dm_${b.toLowerCase()}_manager`;
  const [x, y] = [a, b].sort();
  return `bf_dm_${x.toLowerCase()}_${y.toLowerCase()}`;
}
function loadSS<T>(key: string, fb: T): T { try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function saveSS(key: string, v: unknown) { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch {} }
function uid() { return Math.random().toString(36).slice(2, 10); }
function timeFmt(ts: number) { return new Date(ts).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }); }
function getNow() { const n = new Date(); return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`; }
function getToday() { return new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" }); }

/* Simulated auto-replies */
const AUTO_REPLIES: Record<string, string[]> = {
  Marcus: ["Godt spoergsmaal, lad mig tjekke.", "Ja, det kan jeg godt. Giv mig fem minutter.", "Har du spurgt Lars om det?"],
  Emil: ["Kommer lige!", "Fedt, tak for besked.", "Lad os tage det efter frokost."],
  Sofia: ["Perfekt, jeg ordner det.", "Tak! Ses i morgen.", "God ide, lad os proeve det."],
  Manager: ["Tak for beskeden. Jeg vender tilbage.", "Noteret. God dag derude!", "Lad os tage det op paa naeste moedet."],
};

/* ─── Icons (inline SVG) ──────────────────────────────────────────────────── */
function IconCalendar() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconChat() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function IconClock() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconSwap() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>; }
function IconTeam() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconLogout() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconPaperclip() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>; }
function IconSettings() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function IconFile() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconImage() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }

/* Online dot component */
function OnlineDot({ online, size = 10 }: { online: boolean; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: online ? "#4ade80" : "#ef4444",
      border: "2px solid var(--bg)",
      position: "absolute", bottom: 0, right: 0,
    }} />
  );
}

/* ─── Login Screen ─────────────────────────────────────────────────────────── */
function TeamLogin({ onLogin }: { onLogin: (n: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel || !pin.trim()) { setErr("Vaelg dit navn og skriv en pinkode."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(sel); }, 700);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse,rgba(184,152,90,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", fontWeight: 700, color: "var(--text)" }}>Nordklip</span>
          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(184,152,90,0.08)", border: "1px solid rgba(184,152,90,0.2)", borderRadius: "4px", padding: "3px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--gold)" }}>Team Portal</span>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Log ind som medarbejder</h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>Vaelg dit navn og indtast din pinkode.</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {TEAM.map(m => (
              <button key={m.name} onClick={() => { setSel(m.name); setErr(""); }} style={{
                flex: 1, padding: "14px 8px", borderRadius: "10px", cursor: "pointer",
                background: sel === m.name ? `${m.color}14` : "var(--surface)",
                border: `1px solid ${sel === m.name ? m.color + "44" : "var(--border)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.12s",
              }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={m.photo} alt={m.name} style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${sel === m.name ? m.color : "var(--border)"}`, opacity: sel === m.name ? 1 : 0.6 }} />
                  <OnlineDot online={m.online} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: sel === m.name ? 700 : 500, color: sel === m.name ? "var(--text)" : "var(--text-secondary)" }}>{m.name}</span>
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Pinkode</label>
              <input type="password" placeholder="----" value={pin} onChange={e => { setPin(e.target.value); setErr(""); }}
                style={{ width: "100%", letterSpacing: "0.3em", fontSize: "18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", padding: "10px 14px", boxSizing: "border-box" as const, outline: "none" }} />
              {err && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "5px" }}>{err}</p>}
            </div>
            <button type="submit" disabled={loading || !sel} style={{
              background: loading || !sel ? "var(--surface)" : "var(--gold)",
              color: loading || !sel ? "var(--text-secondary)" : "#0A0A0A",
              border: "none", borderRadius: "8px", padding: "13px 24px", fontSize: "14px", fontWeight: 700,
              cursor: loading || !sel ? "default" : "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              {loading ? <>Logger ind...</> : "Log ind"}
            </button>
          </form>
          <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(184,152,90,0.05)", border: "1px solid rgba(184,152,90,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>Demo -- </span>vaelg et navn og skriv en vilkaarlig pinkode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Appointment Row ──────────────────────────────────────────────────────── */
function ApptRow({ appt, myName, isPast, onOfferSwap, swapOffered, onCancelSwap }: {
  appt: Appt; myName: string; isPast: boolean;
  onOfferSwap?: () => void; swapOffered?: boolean; onCancelSwap?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const color = SVC_COLOR[appt.service] || "#B8985A";
  const mc = MEMBER[appt.barber as MemberName]?.color || "var(--gold)";
  const isMe = appt.barber === myName;
  return (
    <div style={{ background: isMe ? `${mc}0A` : "var(--surface)", border: `1px solid ${isMe ? mc + "33" : "var(--border)"}`, borderRadius: "8px", overflow: "hidden", opacity: isPast ? 0.45 : 1, transition: "all 0.25s" }}>
      <div style={{ display: "flex", alignItems: "center", cursor: appt.notes ? "pointer" : "default" }} onClick={() => appt.notes && setOpen(o => !o)}>
        <div style={{ width: "68px", flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "13px 8px", background: "rgba(0,0,0,0.15)", gap: "2px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: isPast ? "var(--text-secondary)" : "var(--text)" }}>{appt.time}</span>
          <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{appt.duration} min</span>
        </div>
        <div style={{ flex: 1, padding: "12px 16px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{appt.service}</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{appt.client}</span>
          {appt.notes && <div style={{ marginTop: "2px", fontSize: "10px", color: "var(--text-secondary)", fontStyle: "italic" }}>Bemaerkning</div>}
        </div>
        <div style={{ padding: "12px 14px", borderLeft: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={MEMBER[appt.barber as MemberName]?.photo} alt={appt.barber} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${mc}55` }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? mc : "var(--text-secondary)" }}>{appt.barber}</span>
        </div>
        {isMe && !isPast && onOfferSwap && (
          <button onClick={e => { e.stopPropagation(); onOfferSwap(); }} style={{
            margin: "8px 12px 8px 0",
            background: swapOffered ? "rgba(74,222,128,0.1)" : "var(--surface)",
            border: `1px solid ${swapOffered ? "rgba(74,222,128,0.35)" : "var(--border)"}`,
            borderRadius: "6px", padding: "5px 10px", fontSize: "10px", fontWeight: 600,
            color: swapOffered ? "#4ade80" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap",
          }}>{swapOffered ? "Byt tilbudt" : "Tilbyd byt"}</button>
        )}
        {swapOffered && onCancelSwap && (
          <button onClick={e => { e.stopPropagation(); onCancelSwap(); }} style={{
            margin: "8px 12px 8px 0",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "6px", padding: "5px 8px", fontSize: "10px", fontWeight: 600,
            color: "#ef4444", cursor: "pointer", whiteSpace: "nowrap",
          }}>Annuller</button>
        )}
      </div>
      {open && appt.notes && (
        <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border)", background: "rgba(184,152,90,0.04)", display: "flex", gap: "8px" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px", color: "var(--gold)" }}><path d="M2 2h8v7H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><line x1="4" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.1" /><line x1="4" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1.1" /></svg>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Swap Modal ───────────────────────────────────────────────────────────── */
function SwapModal({ appt, myName, onClose, onConfirm }: { appt: Appt; myName: string; onClose: () => void; onConfirm: (target: string, note: string) => void; }) {
  const [target, setTarget] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const others = TEAM.filter(m => m.name !== myName);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", width: "100%", maxWidth: "440px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Tilbyd vagtbyt</div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>{appt.service} - {appt.time} - {appt.client}</div>
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Hvem vil du tilbyde vagten til?</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {others.map(m => (
              <button key={m.name} onClick={() => setTarget(m.name)} style={{
                flex: 1, padding: "12px 8px", borderRadius: "10px", cursor: "pointer",
                background: target === m.name ? `${m.color}14` : "var(--surface)",
                border: `1px solid ${target === m.name ? m.color + "55" : "var(--border)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.12s",
              }}>
                <img src={m.photo} alt={m.name} style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${target === m.name ? m.color : "var(--border)"}`, opacity: target === m.name ? 1 : 0.65 }} />
                <span style={{ fontSize: "12px", fontWeight: target === m.name ? 700 : 400, color: target === m.name ? "var(--text)" : "var(--text-secondary)" }}>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "8px" }}>Besked (valgfri)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="F.eks. 'Kan du tage denne? Tandlaege kl. 14'" style={{ width: "100%", minHeight: "70px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 12px", resize: "vertical", boxSizing: "border-box" as const, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Annuller</button>
          <button disabled={!target} onClick={() => target && onConfirm(target, note)} style={{
            flex: 2, padding: "11px", background: target ? "var(--gold)" : "var(--surface)",
            border: "none", borderRadius: "8px", color: target ? "#0A0A0A" : "var(--text-secondary)",
            fontSize: "13px", fontWeight: 700, cursor: target ? "pointer" : "default", transition: "all 0.15s",
          }}>Send vagtbyt-foresp.</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Panel ───────────────────────────────────────────────────────── */
function SettingsPanel({ myName, onClose }: { myName: string; onClose: () => void }) {
  const member = MEMBER[myName as MemberName]!;
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", width: "100%", maxWidth: "400px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <img src={member.photo} alt={myName} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${member.color}` }} />
          <div>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>{member.fullName}</div>
            <div style={{ fontSize: "12px", color: member.color }}>{member.role}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            { label: "Skift profilbillede", action: "Profilbillede opdateret" },
            { label: "Skift adgangskode", action: "Adgangskode aendret" },
            { label: "Notifikationer", action: "Notifikationer opdateret", toggle: true },
            { label: "Sprog", action: "Sprog gemt", sub: "Dansk" },
          ].map(item => (
            <button key={item.label} onClick={() => showToast(item.action)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 14px", borderRadius: "8px", background: "transparent",
              border: "1px solid transparent", cursor: "pointer", transition: "all 0.1s",
              textAlign: "left",
            }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(184,152,90,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>
              <span style={{ fontSize: "13px", color: "var(--text)" }}>{item.label}</span>
              {item.toggle && <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: "#4ade80", position: "relative" }}><div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", right: "2px" }} /></div>}
              {item.sub && <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.sub}</span>}
            </button>
          ))}
        </div>

        <button onClick={onClose} style={{ width: "100%", marginTop: "16px", padding: "11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Luk</button>

        {toast && (
          <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#4ade80", color: "#0A0A0A", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Chat Panel ───────────────────────────────────────────────────────────── */
function ChatPanel({ myName }: { myName: string }) {
  type Contact = "all" | "Manager" | MemberName;
  const [contact, setContact] = useState<Contact>("all");
  const [allMsgs, setAllMsgs] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [attachToast, setAttachToast] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const member = MEMBER[myName as MemberName]!;
  const seededRef = useRef(false);

  /* Seed messages on first mount */
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const existing = loadSS<Record<string, Msg[]>>("bf_chat_msgs", {});
    if (Object.keys(existing).length === 0) {
      const seeds = getSeedMessages(myName);
      setAllMsgs(seeds);
      saveSS("bf_chat_msgs", seeds);
    } else {
      setAllMsgs(existing);
    }
  }, [myName]);

  const key = chatKeyFn(myName, contact === "all" ? "all" : contact);
  const msgs = allMsgs[key] || [];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = useCallback(() => {
    if (!input.trim()) return;
    const m: Msg = { id: uid(), sender: myName, text: input.trim(), ts: Date.now() };
    const updated = { ...allMsgs, [key]: [...(allMsgs[key] || []), m] };
    setAllMsgs(updated);
    saveSS("bf_chat_msgs", updated);
    setInput("");

    /* Simulated typing + auto-reply */
    const responder = contact === "all"
      ? TEAM.filter(t => t.name !== myName)[Math.floor(Math.random() * (TEAM.length - 1))]?.name
      : contact === "Manager" ? "Manager" : contact;
    if (responder) {
      setTyping(responder);
      const replies = AUTO_REPLIES[responder] || ["Ok."];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setTimeout(() => {
        setTyping(null);
        const rm: Msg = { id: uid(), sender: responder, text: reply, ts: Date.now() };
        setAllMsgs(prev => {
          const n = { ...prev, [key]: [...(prev[key] || []), rm] };
          saveSS("bf_chat_msgs", n);
          return n;
        });
      }, 1500 + Math.random() * 1500);
    }
  }, [input, allMsgs, key, myName, contact]);

  function handleAttach() {
    const fakeFiles = ["foto_station2.jpg", "vagtplan_uge12.pdf", "ny_prisliste.xlsx", "kunde_notat.docx"];
    const f = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    const isImg = f.endsWith(".jpg");
    const m: Msg = {
      id: uid(), sender: myName, text: "", ts: Date.now(),
      attachment: { name: f, size: isImg ? "2.4 MB" : "156 KB", type: isImg ? "image" : "file" },
    };
    const updated = { ...allMsgs, [key]: [...(allMsgs[key] || []), m] };
    setAllMsgs(updated);
    saveSS("bf_chat_msgs", updated);
    setAttachToast(`Fil vedhaeftet: ${f}`);
    setTimeout(() => setAttachToast(""), 2000);
  }

  const contacts: { id: Contact; label: string; sublabel: string; color: string; photo?: string; online?: boolean }[] = [
    { id: "all", label: "Alle", sublabel: "Hele teamet", color: "#4ade80", online: true },
    ...TEAM.filter(m => m.name !== myName).map(m => ({ id: m.name as Contact, label: m.fullName, sublabel: m.role, color: m.color, photo: m.photo, online: m.online })),
    { id: "Manager", label: MANAGER.fullName, sublabel: "Ejer", color: MANAGER.color, photo: MANAGER.photo, online: MANAGER.online },
  ];

  const currentContact = contacts.find(c => c.id === contact);
  const getSenderPhoto = (sender: string) => {
    if (sender === myName) return member.photo;
    if (sender === "Manager") return MANAGER.photo;
    const tm = TEAM.find(m => m.name === sender);
    return tm?.photo || MANAGER.photo;
  };
  const getSenderColor = (sender: string) => {
    if (sender === "Manager") return MANAGER.color;
    const tm = TEAM.find(m => m.name === sender);
    return tm?.color || MANAGER.color;
  };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Chat sidebar */}
      <div style={{ width: "240px", flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>Samtaler</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {contacts.map(c => {
            const active = contact === c.id;
            const dmKey = chatKeyFn(myName, c.id === "all" ? "all" : c.id as string);
            const dmMsgs = allMsgs[dmKey] || [];
            const lastMsg = dmMsgs[dmMsgs.length - 1];
            return (
              <button key={c.id} onClick={() => setContact(c.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px",
                borderRadius: "8px", background: active ? `${c.color}14` : "transparent",
                border: `1px solid ${active ? c.color + "33" : "transparent"}`,
                cursor: "pointer", transition: "all 0.1s", textAlign: "left",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {c.photo
                    ? <img src={c.photo} alt={c.label} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${active ? c.color + "55" : "var(--border)"}` }} />
                    : <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: c.color, border: `1px solid ${c.color}33` }}>#</div>
                  }
                  {c.online !== undefined && <OnlineDot online={c.online} size={9} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? "var(--text)" : "var(--text-secondary)", marginBottom: "1px" }}>{c.label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                    {lastMsg ? (lastMsg.attachment ? lastMsg.attachment.name : lastMsg.text) : c.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px" }}>
          {currentContact?.photo && (
            <div style={{ position: "relative" }}>
              <img src={currentContact.photo} alt={currentContact.label} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${currentContact.color}44` }} />
              {currentContact.online !== undefined && <OnlineDot online={currentContact.online} size={9} />}
            </div>
          )}
          {!currentContact?.photo && contact === "all" && (
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#4ade8015", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#4ade80" }}>#</div>
          )}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{currentContact?.label}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {currentContact?.online ? "Online" : "Offline"}
              {contact === "Manager" && " - Svarer inden for 24 timer"}
            </div>
          </div>
          {contact === "all" && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "-4px" }}>
              {TEAM.map(m => (
                <div key={m.name} style={{ position: "relative", marginLeft: "-4px" }}>
                  <img src={m.photo} alt={m.name} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--surface)" }} />
                  <OnlineDot online={m.online} size={8} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {msgs.length === 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
                {contact === "all" ? "Ingen beskeder til teamet endnu." : `Start en samtale med ${currentContact?.label}.`}
              </p>
            </div>
          )}
          {msgs.map(m => {
            const isMe = m.sender === myName;
            return (
              <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                <img src={getSenderPhoto(m.sender)} alt={m.sender} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${getSenderColor(m.sender)}55` }} />
                <div style={{ maxWidth: "72%" }}>
                  {!isMe && <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px", fontWeight: 600 }}>{m.sender} - {timeFmt(m.ts)}</div>}
                  {m.attachment ? (
                    <div style={{
                      padding: "10px 13px", borderRadius: "12px",
                      background: isMe ? `${member.color}1A` : "var(--surface)",
                      border: `1px solid ${isMe ? member.color + "44" : "var(--border)"}`,
                      display: "flex", alignItems: "center", gap: "10px",
                      borderBottomRightRadius: isMe ? "4px" : "12px",
                      borderBottomLeftRadius: isMe ? "12px" : "4px",
                    }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: m.attachment.type === "image" ? "#C49BBF22" : "rgba(184,152,90,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: m.attachment.type === "image" ? "#C49BBF" : "var(--gold)" }}>
                        {m.attachment.type === "image" ? <IconImage /> : <IconFile />}
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{m.attachment.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{m.attachment.size}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: "10px 13px", borderRadius: "12px",
                      background: isMe ? `${member.color}1A` : "var(--surface)",
                      border: `1px solid ${isMe ? member.color + "44" : "var(--border)"}`,
                      fontSize: "13px", color: "var(--text)", lineHeight: 1.5,
                      borderBottomRightRadius: isMe ? "4px" : "12px",
                      borderBottomLeftRadius: isMe ? "12px" : "4px",
                    }}>{m.text}</div>
                  )}
                  {isMe && <div style={{ fontSize: "10px", color: "var(--text-secondary)", textAlign: "right", marginTop: "3px" }}>{timeFmt(m.ts)}</div>}
                </div>
              </div>
            );
          })}
          {typing && (
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <img src={getSenderPhoto(typing)} alt={typing} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${getSenderColor(typing)}55` }} />
              <div style={{ padding: "10px 16px", borderRadius: "12px 12px 12px 4px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                {typing} skriver...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <button onClick={handleAttach} title="Vedhaeft fil" style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
            <IconPaperclip />
          </button>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={contact === "all" ? "Skriv til hele teamet..." : `Skriv til ${currentContact?.label}...`}
            rows={1} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 14px", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" as const }} />
          <button onClick={send} disabled={!input.trim()} style={{
            background: input.trim() ? "var(--gold)" : "var(--surface)",
            border: `1px solid ${input.trim() ? "transparent" : "var(--border)"}`,
            borderRadius: "8px", padding: "10px 16px", cursor: input.trim() ? "pointer" : "default",
            color: input.trim() ? "#0A0A0A" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", transition: "all 0.12s", flexShrink: 0,
          }}>Send</button>
        </div>
      </div>

      {attachToast && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#4ade80", color: "#0A0A0A", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {attachToast}
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
function TeamDashboard({ memberName, onLogout }: { memberName: string; onLogout: () => void }) {
  type Tab = "dag" | "team" | "chat" | "timer" | "vagtbyt";
  const [tab, setTab] = useState<Tab>("dag");
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [swapTarget, setSwapTarget] = useState<Appt | null>(null);
  const [schedule, setSchedule] = useState<Appt[]>(SCHEDULE_BASE);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const member = MEMBER[memberName as MemberName]!;

  useEffect(() => { setSwaps(loadSS<Swap[]>("bf_team_swaps", [])); }, []);

  useEffect(() => {
    const claimed = swaps.filter(s => s.claimedBy);
    if (claimed.length === 0) { setSchedule(SCHEDULE_BASE); return; }
    const updated = SCHEDULE_BASE.map(a => {
      const c = claimed.find(s => s.apptId === a.id);
      return c ? { ...a, barber: c.claimedBy! } : a;
    });
    setSchedule(updated);
  }, [swaps]);

  function offerSwap(appt: Appt, target: string, note: string) {
    const s: Swap = { id: uid(), barber: memberName, apptId: appt.id, time: appt.time, service: appt.service, client: appt.client, duration: appt.duration, targetBarber: target, note, ts: Date.now() };
    const updated = [...swaps, s]; setSwaps(updated); saveSS("bf_team_swaps", updated); setSwapTarget(null);
  }

  function claimSwap(swapId: string) {
    const updated = swaps.map(s => s.id === swapId ? { ...s, claimedBy: memberName } : s);
    setSwaps(updated); saveSS("bf_team_swaps", updated);
  }

  function cancelSwap(swapId: string) {
    const updated = swaps.filter(s => s.id !== swapId);
    setSwaps(updated); saveSS("bf_team_swaps", updated);
  }

  const now = getNow();
  const isPast = (t: string) => t < now;
  const myDay = schedule.filter(a => a.barber === memberName).sort((a, b) => a.time.localeCompare(b.time));
  const myNext = myDay.find(a => !isPast(a.time));
  const offeredToMe = swaps.filter(s => s.targetBarber === memberName && !s.claimedBy);
  const myOffered = swaps.filter(s => s.barber === memberName && !s.claimedBy);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "dag", label: "Dagsoversigt", icon: <IconCalendar /> },
    { key: "team", label: "Hele teamet", icon: <IconTeam /> },
    { key: "chat", label: "Chat", icon: <IconChat />, badge: offeredToMe.length },
    { key: "timer", label: "Mine Arbejdstider", icon: <IconClock /> },
    { key: "vagtbyt", label: "Vagtbytte", icon: <IconSwap />, badge: offeredToMe.length },
  ];

  const todayDow = ["Soen", "Man", "Tir", "Ons", "Tor", "Fre", "Loer"][new Date().getDay()];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="nk-sidebar" style={{
        width: "220px", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo + profile */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", padding: 0 }} title="Indstillinger">
            <img src={member.photo} alt={memberName} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${member.color}`, transition: "all 0.2s" }} />
            <OnlineDot online={member.online} size={12} />
            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "22px", height: "22px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <IconSettings />
            </div>
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{member.fullName}</div>
            <div style={{ fontSize: "11px", color: member.color }}>{member.role}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {tabs.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                borderRadius: "8px", background: active ? `${member.color}14` : "transparent",
                border: `1px solid ${active ? member.color + "33" : "transparent"}`,
                cursor: "pointer", transition: "all 0.1s", width: "100%", textAlign: "left",
                color: active ? "var(--text)" : "var(--text-secondary)",
              }}>
                <span style={{ color: active ? member.color : "var(--text-secondary)", display: "flex" }}>{t.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: active ? 700 : 400 }}>{t.label}</span>
                {t.badge && t.badge > 0 ? <span style={{ marginLeft: "auto", width: "18px", height: "18px", borderRadius: "50%", background: "#4ade80", color: "#0A0A0A", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span> : null}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <button onClick={onLogout} style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
            borderRadius: "8px", background: "transparent", border: "1px solid transparent",
            cursor: "pointer", width: "100%", textAlign: "left", color: "#ef4444", transition: "all 0.1s",
          }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>
            <IconLogout />
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Log ud</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="nk-mobile-topbar" style={{
          display: "none", position: "sticky", top: 0, zIndex: 100,
          background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)", height: "56px",
          alignItems: "center", padding: "0 16px", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, position: "relative" }}>
              <img src={member.photo} alt={memberName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${member.color}` }} />
            </button>
          </div>
        </div>

        {/* Content area */}
        {tab === "chat" ? (
          <ChatPanel myName={memberName} />
        ) : (
          <div style={{ flex: 1, maxWidth: "900px", margin: "0 auto", width: "100%", padding: "28px 24px 100px" }}>

            {/* ── DAGSOVERSIGT ── */}
            {tab === "dag" && (
              <div>
                <div style={{ marginBottom: "22px" }}>
                  <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>God dag, {memberName}</h1>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{getToday()}</p>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {[{ label: "Aftaler", val: myDay.length }, { label: "Gennemfoert", val: myDay.filter(a => isPast(a.time)).length }, { label: "Tilbage", val: myDay.filter(a => !isPast(a.time)).length }].map(({ label, val }) => (
                    <div key={label} style={{ flex: 1, minWidth: "80px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px 18px" }}>
                      <div style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: member.color, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                    </div>
                  ))}
                  {myNext && (
                    <div style={{ flex: 2, minWidth: "180px", background: `${member.color}0D`, border: `1px solid ${member.color}33`, borderRadius: "10px", padding: "16px 18px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "4px" }}>Naeste aftale</div>
                      <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{myNext.time} - {myNext.client}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{myNext.service} - {myNext.duration} min</div>
                    </div>
                  )}
                </div>

                {/* Swap requests */}
                {offeredToMe.length > 0 && (
                  <div style={{ marginBottom: "18px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "10px" }}>Vagtbyt-forespoergsler til dig</div>
                    {offeredToMe.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(74,222,128,0.1)" }}>
                        <img src={MEMBER[s.barber as MemberName]?.photo} alt={s.barber} style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.barber} -- {s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.client} - {s.duration} min</div>
                          {s.note && <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", fontStyle: "italic" }}>{s.note}</div>}
                        </div>
                        <button onClick={() => claimSwap(s.id)} style={{ background: "#4ade8020", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "7px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, color: "#4ade80", cursor: "pointer", flexShrink: 0 }}>Accepter</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Appointments */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {myDay.length === 0
                    ? <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px" }}><p style={{ color: "var(--text-secondary)" }}>Ingen aftaler i dag.</p></div>
                    : myDay.map(a => (
                      <ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)}
                        onOfferSwap={() => setSwapTarget(a)}
                        swapOffered={myOffered.some(s => s.apptId === a.id)}
                        onCancelSwap={myOffered.find(s => s.apptId === a.id) ? () => cancelSwap(myOffered.find(s => s.apptId === a.id)!.id) : undefined} />
                    ))
                  }
                </div>
              </div>
            )}

            {/* ── HELE TEAMET ── */}
            {tab === "team" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Hele teamet</h1>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{getToday()} - {schedule.length} aftaler i alt</p>
                </div>
                {TEAM.map(m => {
                  const apts = schedule.filter(a => a.barber === m.name).sort((a, b) => a.time.localeCompare(b.time));
                  return (
                    <div key={m.name} style={{ marginBottom: "22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ position: "relative" }}>
                          <img src={m.photo} alt={m.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${m.color}44` }} />
                          <OnlineDot online={m.online} size={10} />
                        </div>
                        <div>
                          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>{m.fullName}</span>
                          <span style={{ fontSize: "11px", color: m.color, marginLeft: "8px" }}>{m.role}</span>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-secondary)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 8px" }}>{apts.length} aftaler</span>
                      </div>
                      {apts.length === 0
                        ? <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }}><p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Ingen aftaler i dag.</p></div>
                        : <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{apts.map(a => <ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)} />)}</div>
                      }
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MINE ARBEJDSTIDER (polished) ── */}
            {tab === "timer" && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Mine Arbejdstider</h1>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{member.fullName} - {member.role}</p>
                </div>

                {/* Weekly grid - polished cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "28px" }}>
                  {Object.entries(WORK_HOURS[memberName] || {}).map(([day, hours]) => {
                    const isFri = hours === "Fri";
                    const isToday = day === todayDow;
                    return (
                      <div key={day} style={{
                        background: isToday ? `${member.color}14` : isFri ? "transparent" : "var(--surface)",
                        border: `1px solid ${isToday ? member.color + "55" : isFri ? "var(--border)" : "var(--border)"}`,
                        borderRadius: "10px", padding: "16px 12px", textAlign: "center",
                        opacity: isFri ? 0.5 : 1, position: "relative", overflow: "hidden",
                      }}>
                        {isToday && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: member.color }} />}
                        <div style={{ fontSize: "10px", fontWeight: 700, color: isToday ? member.color : "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "4px" }}>{day}</div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>{DAY_LABELS[day]}</div>
                        {isFri ? (
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Fri</div>
                        ) : (
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: isToday ? "var(--text)" : "var(--text-secondary)" }}>{hours.split("-")[0]}</div>
                            <div style={{ width: "1px", height: "12px", background: "var(--border)", margin: "4px auto" }} />
                            <div style={{ fontSize: "14px", fontWeight: 700, color: isToday ? "var(--text)" : "var(--text-secondary)" }}>{hours.split("-")[1]}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Colleagues */}
                <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "14px" }}>Kollegernes tider</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                  {TEAM.filter(m => m.name !== memberName).map(col => (
                    <div key={col.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ position: "relative" }}>
                          <img src={col.photo} alt={col.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                          <OnlineDot online={col.online} size={9} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{col.fullName}</div>
                          <div style={{ fontSize: "11px", color: col.color }}>{col.role}</div>
                        </div>
                      </div>
                      <div style={{ padding: "8px 16px" }}>
                        {Object.entries(WORK_HOURS[col.name] || {}).map(([day, hrs]) => (
                          <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "12px", color: day === todayDow ? col.color : "var(--text-secondary)", fontWeight: day === todayDow ? 700 : 400 }}>{day}</span>
                            <span style={{ fontSize: "12px", color: hrs === "Fri" ? "var(--text-secondary)" : "var(--text)", fontWeight: hrs === "Fri" ? 400 : 600 }}>{hrs}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VAGTBYTTE ── */}
            {tab === "vagtbyt" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Vagtbytte</h1>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Tilbyd eller accepter vagtbytter med dine kolleger.</p>
                </div>

                {offeredToMe.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Forespoergsler til dig</h3>
                    {offeredToMe.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "8px", marginBottom: "8px" }}>
                        <img src={MEMBER[s.barber as MemberName]?.photo} alt={s.barber} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.barber} -- {s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.client}</div>
                          {s.note && <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "2px" }}>{s.note}</div>}
                        </div>
                        <button onClick={() => claimSwap(s.id)} style={{ background: "#4ade8020", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, color: "#4ade80", cursor: "pointer" }}>Accepter</button>
                      </div>
                    ))}
                  </div>
                )}

                {myOffered.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Dine aktive forespoergsler</h3>
                    {myOffered.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: `${member.color}08`, border: `1px solid ${member.color}22`, borderRadius: "8px", marginBottom: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.service} kl. {s.time} -- {s.client}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Tilbudt til {s.targetBarber}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, padding: "4px 10px", background: `${member.color}14`, borderRadius: "4px", marginRight: "8px" }}>Afventer</span>
                        <button onClick={() => cancelSwap(s.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#ef4444", cursor: "pointer", flexShrink: 0 }}>Annuller</button>
                      </div>
                    ))}
                  </div>
                )}

                {swaps.filter(s => s.claimedBy).length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Gennemfoerte bytter</h3>
                    {swaps.filter(s => s.claimedBy).map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "8px", opacity: 0.6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.barber} → {s.claimedBy}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>Gennemfoert</span>
                      </div>
                    ))}
                  </div>
                )}

                {swaps.length === 0 && offeredToMe.length === 0 && (
                  <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Ingen aktive vagtbytter.</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Gaa til Dagsoversigt og klik "Tilbyd byt" paa en aftale for at starte.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {tab !== "chat" && (
          <div style={{ padding: "24px 0 36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseOver={e => { (e.target as HTMLElement).style.color = "var(--gold)"; }}
              onMouseOut={e => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}>
              Built by Sloth Studio
            </a>
          </div>
        )}
      </main>

      {/* Modals */}
      {swapTarget && <SwapModal appt={swapTarget} myName={memberName} onClose={() => setSwapTarget(null)} onConfirm={(t, n) => offerSwap(swapTarget, t, n)} />}
      {showSettings && <SettingsPanel myName={memberName} onClose={() => setShowSettings(false)} />}

      {/* Mobile bottom nav */}
      <nav className="nk-mobile-nav" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--border)", height: "60px", zIndex: 100,
        alignItems: "center", justifyContent: "space-around", padding: "0 8px",
      }}>
        {tabs.slice(0, 4).map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              background: "transparent", border: "none", cursor: "pointer", padding: "8px",
              color: active ? member.color : "var(--text-secondary)", position: "relative",
            }}>
              {t.icon}
              <span style={{ fontSize: "9px", fontWeight: active ? 700 : 400 }}>{t.label.split(" ")[0]}</span>
              {t.badge && t.badge > 0 ? <span style={{ position: "absolute", top: "4px", right: "4px", width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} /> : null}
            </button>
          );
        })}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nk-sidebar { display: none !important; }
          .nk-mobile-topbar { display: flex !important; }
          .nk-mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Main Export ───────────────────────────────────────────────────────────── */
export default function TeamPage() {
  const [member, setMember] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try { const s = sessionStorage.getItem("bf_team"); if (s) setMember(s); } catch {}
    setChecking(false);
  }, []);

  function handleLogin(name: string) {
    try { sessionStorage.setItem("bf_team", name); } catch {}
    setMember(name);
  }

  function handleLogout() {
    try { sessionStorage.removeItem("bf_team"); sessionStorage.removeItem("bf_session"); sessionStorage.removeItem("bf_chat_msgs"); sessionStorage.removeItem("bf_team_swaps"); } catch {}
    window.location.href = "https://nordklip.pages.dev";
  }

  if (checking) return null;
  if (!member) return <TeamLogin onLogin={handleLogin} />;
  return <TeamDashboard memberName={member} onLogout={handleLogout} />;
}
