"use client";

import { useState, useMemo } from "react";
import { OwnerSidebar } from "../components/OwnerSidebar";

interface Appt {
  time: string; client: string; service: string;
  barber: string; duration: number; notes?: string;
}

const BARBER_PHOTOS: Record<string, string> = {
  "Marcus": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  "Emil":   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "Sofia":  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
};

const SERVICE_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A", "Farve & Stil": "#C49BBF",
};

// Schedule data: keyed by day offset from today (0=today, 1=tomorrow, 2=day after, -1=yesterday)
const SCHEDULE: Record<number, Appt[]> = {
  "-1": [
    { time: "09:30", client: "Lukas Jensen",      service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Mads Christensen",  service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "10:30", client: "Pernille Holm",      service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "11:30", client: "Rasmus Berg",        service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "13:00", client: "Simon Koch",         service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "13:30", client: "Nanna Vestergaard",  service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "14:00", client: "Anders Nielsen",     service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "15:00", client: "Mikkel Dahl",        service: "Junior Cut",      barber: "Marcus", duration: 30 },
    { time: "16:00", client: "Jonas Kjær",         service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "17:00", client: "Thomas Bonde",       service: "Cut & Beard",     barber: "Marcus", duration: 70 },
  ],
  "0": [
    { time: "09:00", client: "Casper Møller",      service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Erik Svendsen",      service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "10:30", client: "Laura Winther",      service: "Farve & Stil",   barber: "Sofia",  duration: 90, notes: "Fuld highlights, lappetest udført" },
    { time: "11:00", client: "Viktor Hansen",      service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "11:30", client: "Frederik Lund",      service: "Cut & Beard",     barber: "Emil",   duration: 70 },
    { time: "13:00", client: "Nikolaj Borg",       service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "13:30", client: "Anna Kristiansen",   service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "14:30", client: "Daniel Westh",       service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "15:30", client: "Sofie Andersen",     service: "Junior Cut",      barber: "Marcus", duration: 30 },
    { time: "16:00", client: "Magnus Brandt",      service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "17:00", client: "Jakob Møller",       service: "Cut & Beard",     barber: "Marcus", duration: 70, notes: "Foretrækker kun saks, ingen maskine" },
  ],
  "1": [
    { time: "09:30", client: "Mikkel Dahl",        service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:00", client: "Rasmus Holm",        service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "11:00", client: "Camilla Voss",       service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "12:00", client: "Tobias Nørgaard",    service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "13:00", client: "Bjarne Kjeldsen",    service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "14:00", client: "Lise Friis",         service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "15:30", client: "Adam Schäfer",       service: "Cut & Beard",     barber: "Emil",   duration: 70 },
    { time: "17:00", client: "Jesper Winther",     service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ],
  "2": [
    { time: "10:00", client: "Søren Bang",         service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { time: "10:30", client: "Ida Markussen",      service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "11:30", client: "Patrick Steen",      service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { time: "13:00", client: "Carl Henriksen",     service: "Junior Cut",      barber: "Marcus", duration: 30 },
    { time: "14:00", client: "Trine Christoffersen", service: "Farve & Stil", barber: "Sofia",  duration: 90 },
    { time: "15:00", client: "Morten Staal",       service: "Cut & Beard",     barber: "Emil",   duration: 70 },
  ],
  "3": [
    { time: "09:00", client: "Henrik Bruun",       service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { time: "10:00", client: "Maja Lindström",     service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "11:30", client: "Lars Thomsen",       service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { time: "13:00", client: "Oliver Brink",       service: "Cut & Beard",     barber: "Marcus", duration: 70 },
    { time: "14:30", client: "Stine Krogh",        service: "Farve & Stil",   barber: "Sofia",  duration: 90 },
    { time: "16:30", client: "Jesper Vind",        service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
  ],
};

const BARBERS = ["Alle", "Marcus", "Emil", "Sofia"];

function getDateLabel(offset: number): string {
  if (offset === 0) return "I dag";
  if (offset === 1) return "I morgen";
  if (offset === -1) return "I går";
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
}

function getFullDate(offset: number): string {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function ApptRow({ appt, isPast }: { appt: Appt; isPast: boolean }) {
  const [open, setOpen] = useState(false);
  const color = SERVICE_COLOR[appt.service] || "#B8985A";
  const photo = BARBER_PHOTOS[appt.barber];

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: "8px",
      overflow: "hidden",
      opacity: isPast ? 0.45 : 1,
    }}>
      <div
        style={{ display: "flex", alignItems: "center", cursor: appt.notes ? "pointer" : "default" }}
        onClick={() => appt.notes && setOpen(o => !o)}
      >
        {/* Time */}
        <div style={{
          width: "72px", flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "14px 8px", background: "var(--surface-2)",
          gap: "2px",
        }}>
          <span className="serif" style={{ fontSize: "16px", fontWeight: 700, color: isPast ? "var(--text-muted)" : "var(--text)" }}>{appt.time}</span>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 500 }}>{appt.duration} min</span>
        </div>

        {/* Service dot + name */}
        <div style={{ flex: 1, padding: "14px 18px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }}/>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{appt.service}</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{appt.client}</span>
          {appt.notes && (
            <div style={{ marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v7H2z" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="var(--text-muted)" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="var(--text-muted)" strokeWidth="1.1"/></svg>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>Bemærkning</span>
            </div>
          )}
        </div>

        {/* Barber */}
        <div style={{
          padding: "14px 18px", flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "10px",
          minWidth: "140px",
        }}>
          {photo && (
            <img src={photo} alt={appt.barber} style={{
              width: "32px", height: "32px", borderRadius: "50%",
              objectFit: "cover", border: "1px solid var(--border-strong)", flexShrink: 0,
            }}/>
          )}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{appt.barber}</div>
            <div style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              color: isPast ? "var(--text-muted)" : "var(--gold)",
              marginTop: "2px",
            }}>{isPast ? "Færdig" : "Bekræftet"}</div>
          </div>
        </div>
      </div>

      {/* Notes expansion */}
      {open && appt.notes && (
        <div style={{
          padding: "10px 18px", borderTop: "1px solid var(--border)",
          background: "rgba(184,152,90,0.04)",
          display: "flex", gap: "8px", alignItems: "flex-start",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}><path d="M2 2h8v7H2z" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="var(--gold)" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="var(--gold)" strokeWidth="1.1"/></svg>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [dayOffset, setDayOffset] = useState(0);
  const [barberFilter, setBarberFilter] = useState("Alle");

  const rawAppts = useMemo(() => (SCHEDULE[dayOffset as keyof typeof SCHEDULE] ?? []).sort((a, b) => a.time.localeCompare(b.time)), [dayOffset]);
  const filtered = useMemo(() => barberFilter === "Alle" ? rawAppts : rawAppts.filter(a => a.barber === barberFilter), [rawAppts, barberFilter]);

  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const isPast = (t: string) => dayOffset < 0 || (dayOffset === 0 && t < nowStr);

  const total = filtered.length;
  const done = filtered.filter(a => isPast(a.time)).length;
  const remaining = total - done;

  function handleLogout() {
    try { sessionStorage.removeItem("bf_owner"); } catch {}
    window.location.href = "/owner";
  }

  return (
    <div className="sidebar-wrapper" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <OwnerSidebar onLogout={handleLogout}/>

      {/* Main column */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        {/* Sticky header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(14,12,9,0.92)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Holdplan</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{getFullDate(dayOffset)}</p>
          </div>
          {/* Stats inline in header */}
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { val: total,     label: "I alt" },
              { val: done,      label: "Færdige" },
              { val: remaining, label: "Resterende" },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Date navigation bar */}
        <div style={{
          borderBottom: "1px solid var(--border)", background: "var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 32px",
        }}>
          <button onClick={() => setDayOffset(d => d - 1)} style={{
            background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", width: "34px", height: "34px", cursor: "pointer",
            color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>{getDateLabel(dayOffset)}</div>
          </div>

          <button onClick={() => setDayOffset(d => d + 1)} style={{
            background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", width: "34px", height: "34px", cursor: "pointer",
            color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <main style={{ padding: "28px 32px 80px", flex: 1 }}>

          {/* Barber filter tabs */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
            <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "3px", gap: "2px" }}>
              {BARBERS.map(b => (
                <button key={b} onClick={() => setBarberFilter(b)} style={{
                  padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: barberFilter === b ? 700 : 400,
                  background: barberFilter === b ? "var(--surface)" : "transparent",
                  border: barberFilter === b ? "1px solid var(--border-strong)" : "1px solid transparent",
                  color: barberFilter === b ? "var(--text)" : "var(--text-muted)",
                  transition: "all 0.12s",
                }}>{b}</button>
              ))}
            </div>
          </div>

          {/* Appointment list */}
          {filtered.length === 0 ? (
            <div style={{
              padding: "48px 24px", textAlign: "center",
              background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px",
            }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Ingen aftaler {barberFilter !== "Alle" ? `for ${barberFilter}` : ""} {getDateLabel(dayOffset).toLowerCase()}.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map((a, i) => (
                <ApptRow key={i} appt={a} isPast={isPast(a.time)}/>
              ))}
            </div>
          )}

          {/* Demo note */}
          <div style={{
            marginTop: "28px", padding: "11px 16px",
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", display: "flex", gap: "10px", alignItems: "flex-start",
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="8" cy="8" r="6.5" stroke="var(--text-muted)" strokeWidth="1.2"/>
              <path d="M8 5.5v3.5M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Holdplan demo — </span>
              dette er hvad barberteamet ser. I produktion synkroniseres alle bookinger i realtid.
            </p>
          </div>
        </main>

        <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
            Bygget af Sloth Studio
          </a>
        </div>
      </div>
    </div>
  );
}

