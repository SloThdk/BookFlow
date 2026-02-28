"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Appt { id: string; time: string; client: string; service: string; barber: string; duration: number; notes?: string; date?: string; }
interface Msg  { id: string; sender: string; text: string; ts: number; attachment?: { name: string; size: string; type: "image"|"file" }; }
interface Swap {
  id: string; barber: string; apptId: string; time: string; service: string;
  client: string; duration: number; note: string; ts: number;
  mode: "ask" | "sell";
  targetBarber?: string;
  claimedBy?: string;
  date?: string;
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const TEAM = [
  { name: "Marcus", fullName: "Marcus Holst", role: "Senior Barber", color: "#B8985A", online: true,
    photo: "https://images.pexels.com/photos/30004312/pexels-photo-30004312.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" },
  { name: "Emil", fullName: "Emil Strand", role: "Barber", color: "#7BA3C4", online: false,
    photo: "https://images.pexels.com/photos/30004318/pexels-photo-30004318.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face" },
  { name: "Sofia", fullName: "Sofia Krag", role: "Barber & Farvespecialist", color: "#C49BBF", online: true,
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
  { id:"a1", time:"09:00", client:"Casper Møller", service:"Classic Cut", barber:"Marcus", duration:45 },
  { id:"a2", time:"10:00", client:"Erik Svendsen", service:"Beard Sculpt", barber:"Emil", duration:30 },
  { id:"a3", time:"10:30", client:"Laura Winther", service:"Farve & Stil", barber:"Sofia", duration:90, notes:"Fuld highlights, lappetest udført" },
  { id:"a4", time:"11:00", client:"Viktor Hansen", service:"Classic Cut", barber:"Marcus", duration:45 },
  { id:"a5", time:"11:30", client:"Frederik Lund", service:"Cut & Beard", barber:"Emil", duration:70 },
  { id:"a6", time:"13:00", client:"Nikolaj Borg", service:"Hot Towel Shave", barber:"Marcus", duration:40 },
  { id:"a7", time:"13:30", client:"Anna Kristiansen", service:"Farve & Stil", barber:"Sofia", duration:90 },
  { id:"a8", time:"14:30", client:"Daniel Westh", service:"Classic Cut", barber:"Emil", duration:45 },
  { id:"a9", time:"15:30", client:"Sofie Andersen", service:"Junior Cut", barber:"Marcus", duration:30 },
  { id:"a10", time:"16:00", client:"Magnus Brandt", service:"Beard Sculpt", barber:"Emil", duration:30 },
  { id:"a11", time:"17:00", client:"Jakob Møller", service:"Cut & Beard", barber:"Marcus", duration:70, notes:"Foretrækker kun saks, ingen maskine" },
];

const WORK_HOURS: Record<string, Record<string, string>> = {
  Marcus: { Man:"09:00-17:30", Tir:"09:00-17:30", Ons:"09:00-17:30", Tor:"09:00-17:30", Fre:"09:00-17:30", Lør:"10:00-15:00", Søn:"Fri" },
  Emil:   { Man:"09:00-17:30", Tir:"09:00-17:30", Ons:"11:00-19:30", Tor:"11:00-19:30", Fre:"09:00-17:30", Lør:"10:00-15:00", Søn:"Fri" },
  Sofia:  { Man:"10:00-18:30", Tir:"10:00-18:30", Ons:"10:00-18:30", Tor:"10:00-18:30", Fre:"10:00-18:30", Lør:"10:00-16:00", Søn:"Fri" },
};


/* Vacation days per barber (simulated) */
const VACATION_DAYS: Record<string, string[]> = {
  Marcus: ["2026-03-14","2026-03-15","2026-03-16","2026-03-17","2026-03-18","2026-04-06","2026-04-07","2026-04-08","2026-04-09","2026-04-10","2026-06-22","2026-06-23","2026-06-24","2026-06-25","2026-06-26","2026-06-27","2026-06-28","2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03"],
  Emil:   ["2026-03-23","2026-03-24","2026-03-25","2026-03-26","2026-03-27","2026-05-11","2026-05-12","2026-05-13","2026-05-14","2026-05-15","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17"],
  Sofia:  ["2026-04-13","2026-04-14","2026-04-15","2026-04-16","2026-04-17","2026-05-25","2026-05-26","2026-05-27","2026-05-28","2026-05-29","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14"],
};

const DAY_KEYS = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
const DAY_FULL: Record<string,string> = { Man:"Mandag", Tir:"Tirsdag", Ons:"Onsdag", Tor:"Torsdag", Fre:"Fredag", Lør:"Lørdag", Søn:"Søndag" };
const MONTH_NAMES = ["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"];

/* Generate simulated shifts for any month */
function generateMonthShifts(year: number, month: number, barber: string): { date: string; hours: string; type: "work"|"off"|"vacation" }[] {
  const shifts: { date: string; hours: string; type: "work"|"off"|"vacation" }[] = [];
  const vacDays = new Set(VACATION_DAYS[barber] || []);
  const hours = WORK_HOURS[barber];
  if (!hours) return shifts;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const dow = dt.getDay();
    const dayKey = DAY_KEYS[dow === 0 ? 6 : dow - 1];
    const h = hours[dayKey];
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (vacDays.has(dateStr)) {
      shifts.push({ date: dateStr, hours: "Ferie", type: "vacation" });
    } else if (h && h !== "Fri") {
      shifts.push({ date: dateStr, hours: h, type: "work" });
    } else {
      shifts.push({ date: dateStr, hours: "Fri", type: "off" });
    }
  }
  return shifts;
}

/* Seed messages */
function getSeedMessages(myName: string): Record<string, Msg[]> {
  const now = Date.now();
  const seeds: Record<string, Msg[]> = {};
  seeds["bf_chat_all"] = [
    { id:"seed1", sender:"Manager", text:"Hej alle — vi har fået nye Wahl Legend clippers ind. De ligger i skuffen under station 2. Husk at rengøre bladene efter hver kunde. Derudover: vi lukker en time tidligere næste fredag pga. maling af facaden. God arbejdslyst!", ts: now - 3600000 },
    { id:"seed2", sender:"Marcus", text:"Fedt, de gamle var ved at være slidte. Tak for opdateringen.", ts: now - 3200000 },
    { id:"seed3", sender:"Sofia", text:"Noteret med fredagen. Skal jeg flytte mine sene aftaler?", ts: now - 2800000 },
  ];
  const others = TEAM.filter(m => m.name !== myName);
  others.forEach(m => {
    const k = chatKeyFn(myName, m.name);
    if (m.name === "Marcus") seeds[k] = [{ id:"seedm1", sender:"Marcus", text:"Har du set den nye pomade fra Layrite? Kunden i morges var vild med den. Vi burde bestille mere.", ts: now - 1800000 }];
    else if (m.name === "Emil") seeds[k] = [{ id:"seede1", sender:"Emil", text:"Er der nogen der har en ekstra kappe? Min er i vask og jeg har en kunde om 20 min.", ts: now - 900000 }];
    else if (m.name === "Sofia") seeds[k] = [{ id:"seeds1", sender:"Sofia", text:"Kan en af jer tage min 15:30? Jeg har en tandlægetid jeg glemte at aflyse.", ts: now - 1200000 }];
  });
  seeds[chatKeyFn(myName, "Manager")] = [{ id:"seedmgr1", sender:"Manager", text:"Hej " + myName + " — husk at opdatere din profil med det nye foto når du får tid. Vi opdaterer hjemmesiden snart.", ts: now - 7200000 }];
  return seeds;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function chatKeyFn(a: string, b: string) {
  if (b === "all" || a === "all") return "bf_chat_all";
  if (b === "Manager") return `bf_dm_${a.toLowerCase()}_manager`;
  if (a === "Manager") return `bf_dm_${b.toLowerCase()}_manager`;
  const [x, y] = [a, b].sort();
  return `bf_dm_${x.toLowerCase()}_${y.toLowerCase()}`;
}
function loadSS<T>(key: string, fb: T): T { try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function saveSS(key: string, v: unknown) { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch {} }
function uid() { return Math.random().toString(36).slice(2, 10); }
function timeFmt(ts: number) { return new Date(ts).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }); }
function getNow() { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; }
function getToday() { return new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" }); }
function fmtDate(d: string) { const dt = new Date(d + "T12:00:00"); return dt.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" }); }

const AUTO_REPLIES: Record<string, string[]> = {
  Marcus: ["Godt spørgsmål, lad mig tjekke.", "Ja, det kan jeg godt. Giv mig fem minutter.", "Har du spurgt Lars om det?"],
  Emil: ["Kommer lige!", "Fedt, tak for besked.", "Lad os tage det efter frokost."],
  Sofia: ["Perfekt, jeg ordner det.", "Tak! Ses i morgen.", "God ide, lad os prøve det."],
  Manager: ["Tak for beskeden. Jeg vender tilbage.", "Noteret. God dag derude!", "Lad os tage det op på næste møde."],
};

/* ─── Icons ────────────────────────────────────────────────────────────────── */
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
function IconChevLeft() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IconChevRight() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

function OnlineDot({ online, size = 10 }: { online: boolean; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: online ? "#4ade80" : "#ef4444", border: "2px solid var(--bg)", position: "absolute", bottom: 0, right: 0 }} />;
}

/* ─── Demo Badge ───────────────────────────────────────────────────────────── */
function DemoBadge() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px", padding: "8px 14px", background: "rgba(184,152,90,0.06)", border: "1px solid rgba(184,152,90,0.15)", borderRadius: "8px" }}>
      <span style={{ background: "var(--gold)", color: "var(--bg)", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Demonstrationsmiljø — data er simuleret og nulstilles ved lukning</span>
    </div>
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
    if (!sel || !pin.trim()) { setErr("Vælg dit navn og skriv en pinkode."); return; }
    setLoading(true); setTimeout(() => { setLoading(false); onLogin(sel); }, 700);
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
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>Vælg dit navn og indtast din pinkode.</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {TEAM.map(m => (
              <button key={m.name} onClick={() => { setSel(m.name); setErr(""); }} style={{ flex: 1, padding: "14px 8px", borderRadius: "10px", cursor: "pointer", background: sel === m.name ? `${m.color}14` : "var(--surface)", border: `1px solid ${sel === m.name ? m.color + "44" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "all 0.12s" }}>
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
              <input type="password" placeholder="----" value={pin} onChange={e => { setPin(e.target.value); setErr(""); }} style={{ width: "100%", letterSpacing: "0.3em", fontSize: "18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", padding: "10px 14px", boxSizing: "border-box" as const, outline: "none" }} />
              {err && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "5px" }}>{err}</p>}
            </div>
            <button type="submit" disabled={loading || !sel} style={{ background: loading || !sel ? "var(--surface)" : "var(--gold)", color: loading || !sel ? "var(--text-secondary)" : "#0A0A0A", border: "none", borderRadius: "8px", padding: "13px 24px", fontSize: "14px", fontWeight: 700, cursor: loading || !sel ? "default" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? "Logger ind..." : "Log ind"}
            </button>
          </form>
          <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(184,152,90,0.05)", border: "1px solid rgba(184,152,90,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>Demo — </span>vælg et navn og skriv en vilkårlig pinkode.
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
        </div>
        <div style={{ padding: "12px 14px", borderLeft: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={MEMBER[appt.barber as MemberName]?.photo} alt={appt.barber} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${mc}55` }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? mc : "var(--text-secondary)" }}>{appt.barber}</span>
        </div>
        {isMe && !isPast && onOfferSwap && (
          <button onClick={e => { e.stopPropagation(); onOfferSwap(); }} style={{ margin: "8px 12px 8px 0", background: swapOffered ? "rgba(74,222,128,0.1)" : "var(--surface)", border: `1px solid ${swapOffered ? "rgba(74,222,128,0.35)" : "var(--border)"}`, borderRadius: "6px", padding: "5px 10px", fontSize: "10px", fontWeight: 600, color: swapOffered ? "#4ade80" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>{swapOffered ? "Vagt tilbudt" : "Tilbyd vagt"}</button>
        )}
        {swapOffered && onCancelSwap && (
          <button onClick={e => { e.stopPropagation(); onCancelSwap(); }} style={{ margin: "8px 12px 8px 0", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "5px 8px", fontSize: "10px", fontWeight: 600, color: "#ef4444", cursor: "pointer", whiteSpace: "nowrap" }}>Annuller</button>
        )}
      </div>
      {open && appt.notes && (
        <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border)", background: "rgba(184,152,90,0.04)", display: "flex", gap: "8px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Swap Modal (Ask or Sell) ─────────────────────────────────────────────── */
function SwapModal({ appt, myName, onClose, onConfirm, allowSell = true }: { appt: Appt; myName: string; onClose: () => void; onConfirm: (mode: "ask"|"sell", target: string | null, note: string) => void; allowSell?: boolean; }) {
  const [mode, setMode] = useState<"ask"|"sell">(allowSell ? "sell" : "ask");
  const [target, setTarget] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const others = TEAM.filter(m => m.name !== myName);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", width: "100%", maxWidth: "480px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Tilbyd vagtbytte</div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px" }}>{appt.service} · {appt.time} · {appt.client}</div>

        {/* Mode toggle — only show if both modes available */}
        {allowSell && <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button onClick={() => setMode("ask")} style={{ flex: 1, padding: "12px", borderRadius: "8px", cursor: "pointer", background: mode === "ask" ? "rgba(184,152,90,0.12)" : "var(--surface)", border: `1px solid ${mode === "ask" ? "var(--gold)" : "var(--border)"}`, textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: mode === "ask" ? "var(--gold)" : "var(--text-secondary)", marginBottom: "2px" }}>Spørg kollega</div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Bed en bestemt person overtage</div>
          </button>
          <button onClick={() => setMode("sell")} style={{ flex: 1, padding: "12px", borderRadius: "8px", cursor: "pointer", background: mode === "sell" ? "rgba(74,222,128,0.08)" : "var(--surface)", border: `1px solid ${mode === "sell" ? "#4ade80" : "var(--border)"}`, textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: mode === "sell" ? "#4ade80" : "var(--text-secondary)", marginBottom: "2px" }}>Sælg vagt</div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Sæt vagten til salg for alle</div>
          </button>
        </div>}

        {mode === "ask" && (
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Hvem vil du spørge?</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {others.map(m => (
                <button key={m.name} onClick={() => setTarget(m.name)} style={{ flex: 1, padding: "12px 8px", borderRadius: "10px", cursor: "pointer", background: target === m.name ? `${m.color}14` : "var(--surface)", border: `1px solid ${target === m.name ? m.color + "55" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.12s" }}>
                  <div style={{ position: "relative" }}>
                    <img src={m.photo} alt={m.name} style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${target === m.name ? m.color : "var(--border)"}`, opacity: target === m.name ? 1 : 0.65 }} />
                    <OnlineDot online={m.online} size={8} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: target === m.name ? 700 : 400, color: target === m.name ? "var(--text)" : "var(--text-secondary)" }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "sell" && (
          <div style={{ marginBottom: "18px", padding: "12px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "8px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>Vagten bliver synlig for alle kolleger. Den første der accepterer, overtager vagten.</p>
          </div>
        )}

        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "8px" }}>Besked (valgfri)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="F.eks. 'Tandlæge kl. 14, kan desværre ikke flytte den'" style={{ width: "100%", minHeight: "70px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 12px", resize: "vertical", boxSizing: "border-box" as const, outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Annuller</button>
          <button disabled={mode === "ask" && !target} onClick={() => onConfirm(mode, mode === "ask" ? target : null, note)} style={{ flex: 2, padding: "11px", background: (mode === "ask" && !target) ? "var(--surface)" : mode === "sell" ? "#4ade80" : "var(--gold)", border: "none", borderRadius: "8px", color: (mode === "ask" && !target) ? "var(--text-secondary)" : "#0A0A0A", fontSize: "13px", fontWeight: 700, cursor: (mode === "ask" && !target) ? "default" : "pointer", transition: "all 0.15s" }}>
            {mode === "ask" ? "Send forespørgsel" : "Sæt til salg"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Cancel Confirmation ──────────────────────────────────────────────────── */
function CancelConfirm({ swap, onConfirm, onClose }: { swap: Swap; onConfirm: () => void; onClose: () => void }) {
  const targetName = swap.mode === "ask" ? swap.targetBarber : "alle";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", width: "100%", maxWidth: "400px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>Annuller vagtbytte?</div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
          Er du sikker på at du vil annullere vagtbyttet med <strong style={{ color: "var(--text)" }}>{targetName}</strong> for <strong style={{ color: "var(--text)" }}>{swap.service}</strong> kl. {swap.time}?
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Behold</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Ja, annuller</button>
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
          {[{ label: "Skift profilbillede", action: "Profilbillede opdateret" }, { label: "Skift adgangskode", action: "Adgangskode ændret" }, { label: "Notifikationer", action: "Notifikationer opdateret", toggle: true }, { label: "Sprog", action: "Sprog gemt", sub: "Dansk" }].map(item => (
            <button key={item.label} onClick={() => showToast(item.action)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", background: "transparent", border: "1px solid transparent", cursor: "pointer", transition: "all 0.1s", textAlign: "left" }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(184,152,90,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>
              <span style={{ fontSize: "13px", color: "var(--text)" }}>{item.label}</span>
              {item.toggle && <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: "#4ade80", position: "relative" }}><div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", right: "2px" }} /></div>}
              {item.sub && <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.sub}</span>}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ width: "100%", marginTop: "16px", padding: "11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Luk</button>
        {toast && <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#4ade80", color: "#0A0A0A", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>{toast}</div>}
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

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seeds = getSeedMessages(myName);
    setAllMsgs(seeds);
  }, [myName]);

  const key = chatKeyFn(myName, contact === "all" ? "all" : contact);
  const msgs = allMsgs[key] || [];
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs, typing]);

  const send = useCallback(() => {
    if (!input.trim()) return;
    const m: Msg = { id: uid(), sender: myName, text: input.trim(), ts: Date.now() };
    const updated = { ...allMsgs, [key]: [...(allMsgs[key] || []), m] };
    setAllMsgs(updated);  setInput("");
    const responder = contact === "all" ? TEAM.filter(t => t.name !== myName)[Math.floor(Math.random() * (TEAM.length - 1))]?.name : contact === "Manager" ? "Manager" : contact;
    if (responder) {
      setTyping(responder);
      const replies = AUTO_REPLIES[responder] || ["Ok."];
      setTimeout(() => {
        setTyping(null);
        const rm: Msg = { id: uid(), sender: responder, text: replies[Math.floor(Math.random() * replies.length)], ts: Date.now() };
        setAllMsgs(prev => { const n = { ...prev, [key]: [...(prev[key] || []), rm] };  return n; });
      }, 1500 + Math.random() * 1500);
    }
  }, [input, allMsgs, key, myName, contact]);

  function handleAttach() {
    const fakeFiles = ["foto_station2.jpg", "vagtplan_uge12.pdf", "ny_prisliste.xlsx", "kunde_notat.docx"];
    const f = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    const isImg = f.endsWith(".jpg");
    const m: Msg = { id: uid(), sender: myName, text: "", ts: Date.now(), attachment: { name: f, size: isImg ? "2.4 MB" : "156 KB", type: isImg ? "image" : "file" } };
    const updated = { ...allMsgs, [key]: [...(allMsgs[key] || []), m] };
    setAllMsgs(updated); 
    setAttachToast(`Fil vedhæftet: ${f}`); setTimeout(() => setAttachToast(""), 2000);
  }

  const contacts: { id: Contact; label: string; sublabel: string; color: string; photo?: string; online?: boolean }[] = [
    { id: "all", label: "Alle", sublabel: "Hele teamet", color: "#4ade80", online: true },
    ...TEAM.filter(m => m.name !== myName).map(m => ({ id: m.name as Contact, label: m.fullName, sublabel: m.role, color: m.color, photo: m.photo, online: m.online })),
    { id: "Manager", label: MANAGER.fullName, sublabel: "Ejer", color: MANAGER.color, photo: MANAGER.photo, online: MANAGER.online },
  ];
  const currentContact = contacts.find(c => c.id === contact);
  const getSenderPhoto = (s: string) => s === myName ? member.photo : s === "Manager" ? MANAGER.photo : TEAM.find(m => m.name === s)?.photo || MANAGER.photo;
  const getSenderColor = (s: string) => s === "Manager" ? MANAGER.color : TEAM.find(m => m.name === s)?.color || MANAGER.color;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <div style={{ width: "240px", flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}><p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>Samtaler</p></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {contacts.map(c => {
            const active = contact === c.id;
            const dmMsgs = allMsgs[chatKeyFn(myName, c.id === "all" ? "all" : c.id as string)] || [];
            const lastMsg = dmMsgs[dmMsgs.length - 1];
            return (
              <button key={c.id} onClick={() => setContact(c.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", background: active ? `${c.color}14` : "transparent", border: `1px solid ${active ? c.color + "33" : "transparent"}`, cursor: "pointer", transition: "all 0.1s", textAlign: "left" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {c.photo ? <img src={c.photo} alt={c.label} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${active ? c.color + "55" : "var(--border)"}` }} />
                    : <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: c.color, border: `1px solid ${c.color}33` }}>#</div>}
                  {c.online !== undefined && <OnlineDot online={c.online} size={9} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? "var(--text)" : "var(--text-secondary)" }}>{c.label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>{lastMsg ? (lastMsg.attachment ? lastMsg.attachment.name : lastMsg.text) : c.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: "12px" }}>
          {currentContact?.photo ? <div style={{ position: "relative" }}><img src={currentContact.photo} alt={currentContact.label} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${currentContact.color}44` }} />{currentContact.online !== undefined && <OnlineDot online={currentContact.online} size={9} />}</div>
            : <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#4ade8015", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#4ade80" }}>#</div>}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{currentContact?.label}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{currentContact?.online ? "Online" : "Offline"}</div>
          </div>
        </div>
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {msgs.length === 0 && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}><p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>{contact === "all" ? "Ingen beskeder til teamet endnu." : `Start en samtale med ${currentContact?.label}.`}</p></div>}
          {msgs.map(m => {
            const isMe = m.sender === myName;
            return (
              <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                <img src={getSenderPhoto(m.sender)} alt={m.sender} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div style={{ maxWidth: "72%" }}>
                  {!isMe && <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px", fontWeight: 600 }}>{m.sender} · {timeFmt(m.ts)}</div>}
                  {m.attachment ? (
                    <div style={{ padding: "10px 13px", borderRadius: "12px", background: isMe ? `${member.color}1A` : "var(--surface)", border: `1px solid ${isMe ? member.color + "44" : "var(--border)"}`, display: "flex", alignItems: "center", gap: "10px", borderBottomRightRadius: isMe ? "4px" : "12px", borderBottomLeftRadius: isMe ? "12px" : "4px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: m.attachment.type === "image" ? "#C49BBF22" : "rgba(184,152,90,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: m.attachment.type === "image" ? "#C49BBF" : "var(--gold)" }}>{m.attachment.type === "image" ? <IconImage /> : <IconFile />}</div>
                      <div><div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{m.attachment.name}</div><div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{m.attachment.size}</div></div>
                    </div>
                  ) : (
                    <div style={{ padding: "10px 13px", borderRadius: "12px", background: isMe ? `${member.color}1A` : "var(--surface)", border: `1px solid ${isMe ? member.color + "44" : "var(--border)"}`, fontSize: "13px", color: "var(--text)", lineHeight: 1.5, borderBottomRightRadius: isMe ? "4px" : "12px", borderBottomLeftRadius: isMe ? "12px" : "4px" }}>{m.text}</div>
                  )}
                  {isMe && <div style={{ fontSize: "10px", color: "var(--text-secondary)", textAlign: "right", marginTop: "3px" }}>{timeFmt(m.ts)}</div>}
                </div>
              </div>
            );
          })}
          {typing && <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}><img src={getSenderPhoto(typing)} alt={typing} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /><div style={{ padding: "10px 16px", borderRadius: "12px 12px 12px 4px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>{typing} skriver...</div></div>}
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <button onClick={handleAttach} title="Vedhæft fil" style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconPaperclip /></button>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={contact === "all" ? "Skriv til hele teamet..." : `Skriv til ${currentContact?.label}...`} rows={1} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", padding: "10px 14px", resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box" as const }} />
          <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? "var(--gold)" : "var(--surface)", border: `1px solid ${input.trim() ? "transparent" : "var(--border)"}`, borderRadius: "8px", padding: "10px 16px", cursor: input.trim() ? "pointer" : "default", color: input.trim() ? "#0A0A0A" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>Send</button>
        </div>
      </div>
      {attachToast && <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#4ade80", color: "#0A0A0A", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 300 }}>{attachToast}</div>}
    </div>
  );
}

/* ─── Calendar Component ───────────────────────────────────────────────────── */
function ShiftCalendar({ barber, memberColor }: { barber: string; memberColor: string }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const shifts = generateMonthShifts(year, month, barber);
  const shiftDateSet = new Set(shifts.map(s => s.date));
  const shiftMap = Object.fromEntries(shifts.map(s => [s.date, s])) as Record<string, { date: string; hours: string; type: string }>;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`;

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }
  function goToday() { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()); }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedInfo = selectedDate ? shiftMap[selectedDate] : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button onClick={prevMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><IconChevLeft /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>{MONTH_NAMES[month]} {year}</div>
          <button onClick={goToday} style={{ background: "transparent", border: "none", color: memberColor, fontSize: "11px", fontWeight: 600, cursor: "pointer", marginTop: "2px" }}>I dag</button>
        </div>
        <button onClick={nextMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><IconChevRight /></button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
        {DAY_KEYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.06em", padding: "8px 0" }}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const info = shiftMap[dateStr];
          const hasShift = info?.type === "work";
          const isVacation = info?.type === "vacation";
          const isOff = info?.type === "off";
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <button key={dateStr} onClick={() => setSelectedDate(isSelected ? null : dateStr)} style={{
              padding: "10px 4px", borderRadius: "8px", cursor: "pointer", textAlign: "center",
              background: isSelected ? `${memberColor}22` : isVacation ? "rgba(251,191,36,0.08)" : hasShift ? "rgba(74,222,128,0.06)" : "transparent",
              border: `1px solid ${isSelected ? memberColor : isToday ? memberColor + "55" : isVacation ? "rgba(251,191,36,0.2)" : hasShift ? "rgba(74,222,128,0.15)" : "transparent"}`,
              position: "relative", transition: "all 0.1s",
            }}>
              <div style={{ fontSize: "14px", fontWeight: isToday || hasShift ? 700 : 400, color: isToday ? memberColor : isVacation ? "#fbbf24" : hasShift ? "#4ade80" : isOff ? "#ef4444" : "var(--text-secondary)" }}>{day}</div>
              {hasShift && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4ade80", margin: "3px auto 0" }} />}
              {isVacation && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" style={{ display: "block", margin: "2px auto 0" }}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>}
              {isOff && !isVacation && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#ef4444", margin: "3px auto 0" }} />}
            </button>
          );
        })}
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div style={{ marginTop: "16px", padding: "16px", background: "var(--surface)", border: `1px solid ${selectedInfo?.type === "work" ? "rgba(74,222,128,0.3)" : selectedInfo?.type === "vacation" ? "rgba(251,191,36,0.3)" : "var(--border)"}`, borderRadius: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{fmtDate(selectedDate)}</div>
          {selectedInfo?.type === "work" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "14px", color: "#4ade80", fontWeight: 600 }}>{selectedInfo.hours}</span>
            </div>
          ) : selectedInfo?.type === "vacation" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              <span style={{ fontSize: "14px", color: "#fbbf24", fontWeight: 600 }}>Ferie</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ fontSize: "13px", color: "#ef4444" }}>Fri</span>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "14px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} /><span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Vagt</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} /><span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Fri</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg><span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Ferie</span></div>
      </div>
    </div>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
function TeamDashboard({ memberName, onLogout }: { memberName: string; onLogout: () => void }) {
  type Tab = "dag" | "team" | "chat" | "timer" | "vagtbyt";
  const [tab, setTab] = useState<Tab>("dag");
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [swapTarget, setSwapTarget] = useState<Appt | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Swap | null>(null);
  const [schedule, setSchedule] = useState<Appt[]>(SCHEDULE_BASE);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success"|"error"|"info" } | null>(null);
  const member = MEMBER[memberName as MemberName]!;

  function playNotifSound(accepted: boolean) {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      if (accepted) {
        osc.frequency.value = 880; osc.type = "sine"; osc.start(); osc.stop(ctx.currentTime + 0.1);
        setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.connect(g2); g2.connect(ctx.destination); g2.gain.value = 0.15; o2.frequency.value = 1174; o2.type = "sine"; o2.start(); o2.stop(ctx.currentTime + 0.15); }, 120);
      } else {
        osc.frequency.value = 440; osc.type = "sine"; osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.connect(g2); g2.connect(ctx.destination); g2.gain.value = 0.15; o2.frequency.value = 330; o2.type = "sine"; o2.start(); o2.stop(ctx.currentTime + 0.2); }, 180);
      }
    } catch {}
  }

  function showToast(text: string, type: "success"|"error"|"info" = "info") {
    setToast({ text, type }); setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => { setSwaps([]); }, []);

  useEffect(() => {
    const claimed = swaps.filter(s => s.claimedBy);
    if (claimed.length === 0) { setSchedule(SCHEDULE_BASE); return; }
    setSchedule(SCHEDULE_BASE.map(a => { const c = claimed.find(s => s.apptId === a.id); return c ? { ...a, barber: c.claimedBy! } : a; }));
  }, [swaps]);

  function offerSwap(appt: Appt, mode: "ask"|"sell", target: string | null, note: string) {
    const s: Swap = { id: uid(), barber: memberName, apptId: appt.id, time: appt.time, service: appt.service, client: appt.client, duration: appt.duration, note, ts: Date.now(), mode, targetBarber: target || undefined };
    const updated = [...swaps, s]; setSwaps(updated);  setSwapTarget(null);

    // Simulate response after 3-6 seconds (80% accept, 20% reject)
    const acceptor = mode === "ask" ? target! : TEAM.filter(t => t.name !== memberName)[Math.floor(Math.random() * (TEAM.length - 1))].name;
    const willAccept = Math.random() > 0.2;
    setTimeout(() => {
      if (willAccept) {
        setSwaps(prev => {
          const u = prev.map(sw => sw.id === s.id ? { ...sw, claimedBy: acceptor } : sw);
          return u;
        });
        playNotifSound(true);
        showToast(`${acceptor} har accepteret at overtage din vagt (${appt.service} kl. ${appt.time})`, "success");
      } else {
        setSwaps(prev => prev.filter(sw => sw.id !== s.id));
        playNotifSound(false);
        showToast(`${acceptor} har afvist din vagtforespørgsel (${appt.service} kl. ${appt.time})`, "error");
      }
    }, 3000 + Math.random() * 3000);
  }

  function cancelSwap(swapId: string) {
    const updated = swaps.filter(s => s.id !== swapId);
    setSwaps(updated);  setCancelTarget(null);
    showToast("Vagtbytte annulleret", "info");
  }

  function claimSwap(swapId: string) {
    const updated = swaps.map(s => s.id === swapId ? { ...s, claimedBy: memberName } : s);
    setSwaps(updated); 
  }

  const now = getNow();
  const isPast = (t: string) => t < now;
  const myDay = schedule.filter(a => a.barber === memberName).sort((a, b) => a.time.localeCompare(b.time));
  const myNext = myDay.find(a => !isPast(a.time));
  const offeredToMe = swaps.filter(s => (s.targetBarber === memberName || (s.mode === "sell" && s.barber !== memberName)) && !s.claimedBy);
  const myOffered = swaps.filter(s => s.barber === memberName && !s.claimedBy);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "dag", label: "Dagsoversigt", icon: <IconCalendar /> },
    { key: "team", label: "Hele teamet", icon: <IconTeam /> },
    { key: "chat", label: "Chat", icon: <IconChat /> },
    { key: "timer", label: "Mine Arbejdstider", icon: <IconClock /> },
    { key: "vagtbyt", label: "Vagtbytte", icon: <IconSwap />, badge: offeredToMe.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* ── Sidebar ── */}
      <aside className="nk-sidebar" style={{ width: "220px", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", padding: 0 }} title="Indstillinger">
            <img src={member.photo} alt={memberName} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${member.color}`, transition: "all 0.2s" }} />
            <OnlineDot online={member.online} size={12} />
            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "22px", height: "22px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><IconSettings /></div>
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{member.fullName} <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 400 }}>(dig)</span></div>
            <div style={{ fontSize: "11px", color: member.color }}>{member.role}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {tabs.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: active ? `${member.color}14` : "transparent", border: `1px solid ${active ? member.color + "33" : "transparent"}`, cursor: "pointer", transition: "all 0.1s", width: "100%", textAlign: "left", color: active ? "var(--text)" : "var(--text-secondary)" }}>
                <span style={{ color: active ? member.color : "var(--text-secondary)", display: "flex" }}>{t.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: active ? 700 : 400 }}>{t.label}</span>
                {t.badge && t.badge > 0 ? <span style={{ marginLeft: "auto", width: "18px", height: "18px", borderRadius: "50%", background: "#4ade80", color: "#0A0A0A", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span> : null}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "transparent", border: "1px solid transparent", cursor: "pointer", width: "100%", textAlign: "left", color: "#ef4444", transition: "all 0.1s" }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <IconLogout /><span style={{ fontSize: "13px", fontWeight: 600 }}>Log ud</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="nk-mobile-topbar" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)", height: "56px", alignItems: "center", padding: "0 16px", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, position: "relative" }}><img src={member.photo} alt={memberName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${member.color}` }} /></button>
        </div>

        {tab === "chat" ? <ChatPanel myName={memberName} /> : (
          <div style={{ flex: 1, maxWidth: "960px", margin: "0 auto", width: "100%", padding: "32px 28px 100px" }}>
            <DemoBadge />

            {/* ── DAGSOVERSIGT ── */}
            {tab === "dag" && (
              <div>
                <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>God dag, {memberName}</h1>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>{getToday()}</p>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {[{ label: "Aftaler", val: myDay.length }, { label: "Gennemført", val: myDay.filter(a => isPast(a.time)).length }, { label: "Tilbage", val: myDay.filter(a => !isPast(a.time)).length }].map(({ label, val }) => (
                    <div key={label} style={{ flex: 1, minWidth: "80px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px 18px" }}>
                      <div style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: member.color, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                    </div>
                  ))}
                  {myNext && (
                    <div style={{ flex: 2, minWidth: "180px", background: `${member.color}0D`, border: `1px solid ${member.color}33`, borderRadius: "10px", padding: "16px 18px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "4px" }}>Næste aftale</div>
                      <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{myNext.time} · {myNext.client}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{myNext.service} · {myNext.duration} min</div>
                    </div>
                  )}
                </div>
                {offeredToMe.length > 0 && (
                  <div style={{ marginBottom: "18px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "10px" }}>Vagtbytte-forespørgsler til dig</div>
                    {offeredToMe.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(74,222,128,0.1)" }}>
                        <img src={MEMBER[s.barber as MemberName]?.photo} alt={s.barber} style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.barber} — {s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.mode === "sell" ? "Sat til salg" : `Spørger dig direkte`} · {s.client}</div>
                        </div>
                        <button onClick={() => claimSwap(s.id)} style={{ background: "#4ade8020", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "7px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, color: "#4ade80", cursor: "pointer", flexShrink: 0 }}>Accepter</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {myDay.length === 0 ? <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px" }}><p style={{ color: "var(--text-secondary)" }}>Ingen aftaler i dag.</p></div>
                    : myDay.map(a => <ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)} onOfferSwap={() => setSwapTarget(a)} swapOffered={myOffered.some(s => s.apptId === a.id)} onCancelSwap={myOffered.find(s => s.apptId === a.id) ? () => setCancelTarget(myOffered.find(s => s.apptId === a.id)!) : undefined} />)
                  }
                </div>
              </div>
            )}

            {/* ── HELE TEAMET ── */}
            {tab === "team" && (
              <div>
                <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Hele teamet</h1>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>{getToday()} · {schedule.length} aftaler i alt</p>
                {TEAM.map(m => {
                  const apts = schedule.filter(a => a.barber === m.name).sort((a, b) => a.time.localeCompare(b.time));
                  return (
                    <div key={m.name} style={{ marginBottom: "22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ position: "relative" }}><img src={m.photo} alt={m.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${m.color}44` }} /><OnlineDot online={m.online} size={10} /></div>
                        <div><span style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>{m.fullName}{m.name === memberName && <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 400, marginLeft: "6px" }}>(dig)</span>}</span><span style={{ fontSize: "11px", color: m.color, marginLeft: "8px" }}>{m.role}</span></div>
                        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-secondary)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 8px" }}>{apts.length} aftaler</span>
                      </div>
                      {apts.length === 0 ? <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }}><p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Ingen aftaler i dag.</p></div>
                        : <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{apts.map(a => <ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)} />)}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MINE ARBEJDSTIDER (full calendar) ── */}
            {tab === "timer" && (
              <div>
                <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Mine Arbejdstider</h1>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "28px" }}>{member.fullName} · {member.role}</p>

                {/* Main calendar */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", marginBottom: "28px" }}>
                  <ShiftCalendar barber={memberName} memberColor={member.color} />
                </div>

                {/* Weekly overview - compact */}
                <div style={{ marginBottom: "28px" }}>
                  <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>Ugentlig oversigt</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                    {Object.entries(WORK_HOURS[memberName] || {}).map(([day, hours]) => {
                      const isFri = hours === "Fri";
                      const todayDow = DAY_KEYS[(new Date().getDay() + 6) % 7];
                      const isToday = day === todayDow;
                      return (
                        <div key={day} style={{ background: isToday ? `${member.color}14` : isFri ? "transparent" : "var(--surface)", border: `1px solid ${isToday ? member.color + "55" : "var(--border)"}`, borderRadius: "10px", padding: "16px 10px", textAlign: "center", opacity: isFri ? 0.5 : 1, position: "relative" }}>
                          {isToday && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: member.color, borderRadius: "10px 10px 0 0" }} />}
                          <div style={{ fontSize: "10px", fontWeight: 700, color: isToday ? member.color : "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "6px" }}>{day}</div>
                          {isFri ? <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Fri</div> : (
                            <div style={{ fontSize: "13px", fontWeight: 600, color: isToday ? "var(--text)" : "var(--text-secondary)" }}>{hours}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Colleagues calendars */}
                <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "14px" }}>Kollegernes vagter</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                  {TEAM.filter(m => m.name !== memberName).map(col => (
                    <div key={col.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <div style={{ position: "relative" }}><img src={col.photo} alt={col.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} /><OnlineDot online={col.online} size={9} /></div>
                        <div><div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{col.fullName}</div><div style={{ fontSize: "11px", color: col.color }}>{col.role}</div></div>
                      </div>
                      <ShiftCalendar barber={col.name} memberColor={col.color} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VAGTBYTTE ── */}
            {tab === "vagtbyt" && (
              <div>
                <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Vagtbytte</h1>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "22px" }}>Sælg vagter til alle, eller spørg en bestemt kollega om at overtage.</p>

                {offeredToMe.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Tilgængelige vagter</h3>
                    {offeredToMe.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "10px", marginBottom: "8px" }}>
                        <img src={MEMBER[s.barber as MemberName]?.photo} alt={s.barber} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.barber} — {s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.mode === "sell" ? "Sat til salg" : "Direkte forespørgsel"} · {s.client}</div>
                          {s.note && <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "2px" }}>{s.note}</div>}
                        </div>
                        <button onClick={() => claimSwap(s.id)} style={{ background: "#4ade8020", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "7px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, color: "#4ade80", cursor: "pointer" }}>Overtag vagt</button>
                      </div>
                    ))}
                  </div>
                )}

                {myOffered.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Dine aktive forespørgsler</h3>
                    {myOffered.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: `${member.color}08`, border: `1px solid ${member.color}22`, borderRadius: "10px", marginBottom: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.service} kl. {s.time} — {s.client}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.mode === "sell" ? "Til salg for alle" : `Sendt til ${s.targetBarber}`}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, padding: "4px 10px", background: `${member.color}14`, borderRadius: "4px" }}>Afventer</span>
                        <button onClick={() => setCancelTarget(s)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: "#ef4444", cursor: "pointer", flexShrink: 0 }}>Annuller</button>
                      </div>
                    ))}
                  </div>
                )}

                {swaps.filter(s => s.claimedBy).length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Gennemførte bytter</h3>
                    {swaps.filter(s => s.claimedBy).map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "8px", opacity: 0.6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.service} kl. {s.time}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.barber} → {s.claimedBy}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>Gennemført</span>
                      </div>
                    ))}
                  </div>
                )}

                {swaps.length === 0 && offeredToMe.length === 0 && (
                  <div style={{ padding: "48px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Ingen aktive vagtbytter.</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Gå til Dagsoversigt og klik "Tilbyd vagt" på en aftale for at starte.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab !== "chat" && (
          <div style={{ padding: "24px 0 36px", display: "flex", justifyContent: "center" }}>
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none" }}>Built by Sloth Studio</a>
          </div>
        )}
      </main>

      {swapTarget && <SwapModal appt={swapTarget} myName={memberName} onClose={() => setSwapTarget(null)} onConfirm={(mode, target, note) => offerSwap(swapTarget, mode, target, note)} />}
      {cancelTarget && <CancelConfirm swap={cancelTarget} onConfirm={() => cancelSwap(cancelTarget.id)} onClose={() => setCancelTarget(null)} />}
      {showSettings && <SettingsPanel myName={memberName} onClose={() => setShowSettings(false)} />}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "#0A0A0A" : toast.type === "error" ? "#0A0A0A" : "#0A0A0A",
          border: `1px solid ${toast.type === "success" ? "#4ade80" : toast.type === "error" ? "#ef4444" : "var(--border)"}`,
          padding: "16px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, zIndex: 300,
          boxShadow: "0 12px 48px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: "12px",
          maxWidth: "500px", minWidth: "300px",
          color: toast.type === "success" ? "#4ade80" : toast.type === "error" ? "#ef4444" : "var(--text)",
          animation: "slideUp 0.3s ease",
        }}>
          {toast.type === "success" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 16 9.5"/></svg>}
          {toast.type === "error" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          <span>{toast.text}</span>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } } @media (max-width: 768px) { .nk-sidebar { display: none !important; } .nk-mobile-topbar { display: flex !important; } .nk-mobile-nav { display: flex !important; } }`}</style>

      <nav className="nk-mobile-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--border)", height: "60px", zIndex: 100, alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
        {tabs.slice(0, 4).map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: active ? member.color : "var(--text-secondary)", position: "relative" }}>
              {t.icon}<span style={{ fontSize: "9px", fontWeight: active ? 700 : 400 }}>{t.label.split(" ")[0]}</span>
              {t.badge && t.badge > 0 ? <span style={{ position: "absolute", top: "4px", right: "4px", width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} /> : null}
            </button>
          );
        })}
      </nav>

    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function TeamPage() {
  const [member, setMember] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { try { const s = sessionStorage.getItem("bf_team"); if (s) setMember(s); } catch {} setChecking(false); }, []);
  function handleLogin(name: string) { try { sessionStorage.setItem("bf_team", name); } catch {} setMember(name); }
  function handleLogout() { try { sessionStorage.removeItem("bf_team"); sessionStorage.removeItem("bf_session"); sessionStorage.removeItem("bf_chat_msgs"); sessionStorage.removeItem("bf_team_swaps"); } catch {} window.location.href = "https://nordklip.pages.dev"; }
  if (checking) return null;
  if (!member) return <TeamLogin onLogin={handleLogin} />;
  return <TeamDashboard memberName={member} onLogout={handleLogout} />;
}
