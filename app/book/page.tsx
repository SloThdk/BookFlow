"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  id: string; name: string; duration: number; price: number;
  desc: string; category: string; badge?: string; popular?: boolean; photo?: string;
}
interface StaffMember {
  id: string; name: string; role: string; experience: string;
  story: string; tags: string[]; initials: string; photo?: string;
}

// ─── Real Nordklip Services ───────────────────────────────────────────────────
const SERVICES: Service[] = [
  {
    id: "classic-cut",
    name: "Classic Cut",
    category: "Klipning",
    duration: 45, price: 260, popular: true,
    desc: "Vores signaturklip med saks og maskine, stylet og efterbehandlet til perfektion.",
    photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=160&h=160&fit=crop&crop=center",
  },
  {
    id: "beard-sculpt",
    name: "Beard Sculpt",
    category: "Skæg",
    duration: 30, price: 180,
    desc: "Fuld formgivning med barberbladskanter og varm håndklædefinish.",
    photo: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=160&h=160&fit=crop&crop=center",
  },
  {
    id: "cut-beard",
    name: "Cut & Beard",
    category: "Klipning + Skæg",
    duration: 70, price: 390, popular: true,
    desc: "Den fulde Nordklip-oplevelse. Præcisionsklip efterfulgt af komplet skægstyling.",
    photo: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=160&h=160&fit=crop&crop=center",
  },
  {
    id: "hot-towel",
    name: "Hot Towel Shave",
    category: "Barbering",
    duration: 40, price: 220,
    desc: "Traditionel barbering med varmt håndklæde, lige barberblad og plejebalsam.",
    photo: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=160&h=160&fit=crop&crop=center",
  },
  {
    id: "junior-cut",
    name: "Junior Cut",
    category: "Klipning",
    duration: 30, price: 180,
    badge: "Under 16",
    desc: "Samme præcision og omhu — tilpasset og prissat til vores yngre kunder.",
    photo: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=160&h=160&fit=crop&crop=center",
  },
  {
    id: "color-style",
    name: "Farve & Stil",
    category: "Farve",
    duration: 90, price: 550,
    desc: "Rodfarve, highlights eller en fuld farvefornyelse afsluttet med styling.",
    photo: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=160&h=160&fit=crop&crop=center",
  },
];

// ─── Real Nordklip Barbers ────────────────────────────────────────────────────
const STAFF: StaffMember[] = [
  {
    id: "marcus",
    name: "Marcus Holst",
    role: "Senior Barber",
    experience: "8 år",
    story: "Marcus voksede op med at se sin far få sin ugentlige barbering på den lokale barberforretning. Det ritual satte sig fast i ham. Han begyndte at feje gulv som 18-årig og forlod aldrig branchen. Hans specialitet er det klassiske — rene linjer, tætte fadere, klip der stadig sidder rigtigt efter to uger.",
    tags: ["Taper Fades", "Classic Cuts", "Lige barberblad"],
    initials: "MH",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=face",
  },
  {
    id: "emil",
    name: "Emil Strand",
    role: "Barber",
    experience: "4 år",
    story: "Emil kom til barberfaget fra den kreative side — han tilbragte år i Københavns designverden, inden han besluttede sig for at lave noget med sine hænder. Uddannet i byen, tiltrukket af moderne struktur og tekstur. Hans klip har en kant uden at prøve for hårdt.",
    tags: ["Teksturerede klip", "Nordiske blends", "Skin fades"],
    initials: "ES",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop&crop=face",
  },
  {
    id: "sofia",
    name: "Sofia Krag",
    role: "Barber & Farvespecialist",
    experience: "5 år",
    story: "Sofia uddannede sig inden for damestyling, før hun gik over til barberfaget. Den baggrund giver hende noget de fleste barberer ikke har — hun forstår farveteorien på et teknisk niveau. Hun er den eneste hos Nordklip der er kvalificeret til farvninger, og hendes præcisionsklip er blandt de skarpeste i salonnen.",
    tags: ["Præcisionsklip", "Highlights", "Farvning"],
    initials: "SK",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=320&fit=crop&crop=face",
  },
  {
    id: "any",
    name: "Ingen præference",
    role: "Første ledige",
    experience: "",
    story: "Vi finder den barber der passer bedst til din valgte ydelse og dit tidspunkt. Et godt valg, hvis du er fleksibel.",
    tags: ["Bedste ledige", "Fleksibel timing"],
    initials: "--",
  },
];

// ─── Static data ──────────────────────────────────────────────────────────────
const TAKEN_BY_DAY: Record<number, number[]> = {
  1: [1, 4, 9], 2: [3, 6, 11], 3: [0, 5, 8], 4: [2, 7, 10], 5: [1, 5, 9], 6: [4, 6, 8],
};
const TIME_SLOTS = ["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];
const MORNING_SLOTS  = TIME_SLOTS.slice(0, 6);
const AFTERNOON_SLOTS = TIME_SLOTS.slice(6, 12);
const EVENING_SLOTS  = TIME_SLOTS.slice(12);
const STEP_LABELS = ["Ydelse", "Barber", "Dato", "Tid", "Oplysninger"];

const UPCOMING = [
  { name: "Jakob Møller",  service: "Classic Cut",     date: "I morgen",   time: "11:00", barber: "Marcus Holst" },
  { name: "Rasmus Berg",   service: "Beard Sculpt",    date: "Tor 20 mar", time: "14:00", barber: "Emil Strand"  },
  { name: "Laura Winther", service: "Farve & Stil",    date: "Fre 21 mar", time: "11:00", barber: "Sofia Krag"   },
  { name: "Daniel Westh",  service: "Hot Towel Shave", date: "Lør 22 mar", time: "13:30", barber: "Marcus Holst" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: Date) {
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
}
function getAvailDates() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dates: Date[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
    if (dates.length === 14) break;
  }
  return dates;
}

// ─── Service Icons ────────────────────────────────────────────────────────────
function ServiceIcon({ id, active }: { id: string; active: boolean }) {
  const col = active ? "var(--gold)" : "var(--text-muted)";
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: col, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (id === "classic-cut") return <svg {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
  if (id === "beard-sculpt") return <svg {...p}><path d="M4 9h16"/><path d="M4 9v3.5A1.5 1.5 0 0 0 5.5 14h13a1.5 1.5 0 0 0 1.5-1.5V9"/><line x1="8" y1="9" x2="8" y2="5"/><line x1="11" y1="9" x2="11" y2="3"/><line x1="14" y1="9" x2="14" y2="3"/><line x1="17" y1="9" x2="17" y2="5"/></svg>;
  if (id === "cut-beard") return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="1.4"/></svg>;
  if (id === "hot-towel") return <svg {...p}><path d="M12 3c0 0-5 5.5-5 9.5a5 5 0 0 0 10 0C17 8.5 12 3 12 3z"/><path d="M9 13.5c.3 1.5 1.5 2.5 3 2.5"/></svg>;
  if (id === "junior-cut") return <svg {...p}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><line x1="18" y1="5" x2="8" y2="14.5"/><line x1="13.5" y1="13.5" x2="18" y2="19"/><line x1="8" y1="8" x2="11" y2="11"/></svg>;
  // color-style
  return <svg {...p}><path d="M12 2a2 2 0 0 1 2 2c0 1-1 2-1 3h-2c0-1-1-2-1-3a2 2 0 0 1 2-2z"/><path d="M8.5 8h7l1 12H7.5L8.5 8z"/><line x1="10" y1="12" x2="10" y2="17"/><line x1="14" y1="12" x2="14" y2="17"/></svg>;
}

// ─── Check Icon ───────────────────────────────────────────────────────────────
const Check = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8L6.5 11.5L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Progress Steps ───────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "32px" }}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1; const done = current > n; const active = current === n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEP_LABELS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: done ? "var(--gold)" : active ? "var(--gold-dim)" : "var(--surface-2)",
                border: `2px solid ${done || active ? "var(--gold)" : "var(--border-strong)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: active ? "0 0 18px var(--gold-glow)" : "none",
              }}>
                {done ? <Check size={13} color="#0E0C09"/> : (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "var(--gold)" : "var(--text-muted)", lineHeight: 1 }}>{n}</span>
                )}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
                textTransform: "uppercase", letterSpacing: "0.06em",
                color: active ? "var(--gold)" : done ? "var(--text-secondary)" : "var(--text-muted)",
              }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: "1px", marginTop: "15px", marginLeft: "6px", marginRight: "6px",
                background: current > n ? "var(--gold)" : "var(--border-strong)", transition: "background 0.3s",
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const dates = useMemo(() => getAvailDates(), []);

  const { weeks, monthLabel } = useMemo(() => {
    if (!dates.length) return { weeks: [], monthLabel: "" };
    const availSet = new Set(dates.map(d => d.getTime()));
    const first = dates[0];
    const last  = dates[dates.length - 1];
    const start = new Date(first);
    const dow = start.getDay();
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
    const weeksArr: { date: Date; avail: boolean }[][] = [];
    const cursor = new Date(start);
    while (cursor <= last) {
      const week: { date: Date; avail: boolean }[] = [];
      for (let d = 0; d < 6; d++) {
        const day = new Date(cursor);
        day.setDate(cursor.getDate() + d);
        week.push({ date: day, avail: availSet.has(day.getTime()) });
      }
      weeksArr.push(week);
      cursor.setDate(cursor.getDate() + 7);
    }
    return { weeks: weeksArr, monthLabel: first.toLocaleDateString("da-DK", { month: "long", year: "numeric" }) };
  }, [dates]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <span className="serif" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>{monthLabel}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "3px 8px" }}>Lukket søndage</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px", marginBottom: "8px" }}>
        {["Man","Tir","Ons","Tor","Fre","Lør"].map(h => (
          <div key={h} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", padding: "4px 0" }}>{h}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
            {week.map(({ date: d, avail }, di) => {
              const isSel = selected?.getTime() === d.getTime();
              return (
                <button key={di} onClick={() => avail && onSelect(d)} disabled={!avail} style={{
                  aspectRatio: "1", borderRadius: "7px",
                  border: `1px solid ${isSel ? "var(--gold)" : avail ? "var(--border-strong)" : "transparent"}`,
                  background: isSel ? "var(--gold-dim)" : avail ? "var(--surface-2)" : "transparent",
                  cursor: avail ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "4px 2px", transition: "all 0.12s", opacity: avail ? 1 : 0.18,
                  boxShadow: isSel ? "0 0 14px var(--gold-glow)" : "none",
                }}>
                  <span style={{ fontSize: "15px", fontWeight: isSel ? 700 : 500, lineHeight: 1.1, color: isSel ? "var(--gold)" : "var(--text)" }}>{d.getDate()}</span>
                  <span style={{ fontSize: "9px", color: isSel ? "rgba(184,152,90,0.65)" : "var(--text-muted)", marginTop: "1px" }}>{d.toLocaleDateString("da-DK", { month: "short" })}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold-glow)" }}/>
          <p style={{ fontSize: "13px", color: "var(--gold)", fontWeight: 600 }}>{fmtDate(selected)} valgt</p>
        </div>
      )}
    </div>
  );
}

// ─── Time Slot Group ──────────────────────────────────────────────────────────
function TimeGroup({ label, slots, selected, onSelect }: {
  label: string; slots: { time: string; taken: boolean }[];
  selected: string | null; onSelect: (t: string) => void;
}) {
  if (!slots.length) return null;
  const openCount = slots.filter(s => !s.taken).length;
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{label}</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
        <span style={{ fontSize: "10px", color: openCount > 0 ? "var(--text-muted)" : "var(--red)", fontWeight: 600 }}>
          {openCount > 0 ? `${openCount} ledige` : "Fuldt booket"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: "6px" }}>
        {slots.map(({ time: t, taken }) => {
          const sel = selected === t;
          return (
            <button key={t} onClick={() => !taken && onSelect(t)} disabled={taken} style={{
              background: sel ? "var(--gold-dim)" : taken ? "transparent" : "var(--surface-2)",
              border: `1px solid ${sel ? "var(--gold)" : taken ? "var(--border)" : "var(--border-strong)"}`,
              borderRadius: "6px", padding: "10px 6px", cursor: taken ? "default" : "pointer",
              color: sel ? "var(--gold)" : taken ? "var(--text-muted)" : "var(--text)",
              fontSize: "13px", fontWeight: sel ? 700 : 500,
              textDecoration: taken ? "line-through" : "none",
              opacity: taken ? 0.3 : 1, textAlign: "center", transition: "all 0.12s",
              boxShadow: sel ? "0 0 10px var(--gold-glow)" : "none",
            }}>{t}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────
function ConfirmScreen({ service, staffMember, date, time, clientName, clientEmail, onBookAgain }: {
  service: Service; staffMember: StaffMember; date: Date; time: string;
  clientName: string; clientEmail: string; onBookAgain: () => void;
}) {
    // Store contract data for /kontrakt page
  const refNr = 'NK-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const _contractData = {
    refNr,
    clientName,
    clientEmail,
    serviceName: service.name,
    servicePrice: service.price,
    serviceDuration: service.duration,
    barber: staffMember.name,
    date: fmtDate(date),
    time,
    bookedAt: new Date().toLocaleDateString('da-DK', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
  };
  try { sessionStorage.setItem('nordklip_pending_contract', JSON.stringify(_contractData)); } catch {}

return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          background: "var(--gold-dim)", border: "2px solid var(--gold-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", boxShadow: "0 0 36px var(--gold-glow)",
        }}>
          <Check size={26} color="var(--gold)"/>
        </div>
        <h2 className="serif" style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>Booking bekræftet</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Bekræftelse sendt til <span style={{ color: "var(--text-secondary)" }}>{clientEmail}</span>
        </p>
      </div>

      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(184,152,90,0.04)" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold-glow)" }}/>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Din aftale</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "18px", gap: "16px" }}>
          {[["Ydelse", service.name], ["Pris", `${service.price} kr.`], ["Barber", staffMember.name], ["Varighed", `${service.duration} min`], ["Dato", fmtDate(date)], ["Tidspunkt", time]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", fontFamily: l === "Service" ? "var(--font-playfair)" : "inherit" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Kommende hos Nordklip</span>
          <Link href="/bookings" style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>Se alle</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", padding: "12px 18px", borderBottom: "1px solid var(--border)", background: "rgba(184,152,90,0.05)" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-playfair)" }}>{clientName}</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{service.name}</span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{fmtDate(date)}, {time}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "3px", padding: "2px 6px", whiteSpace: "nowrap" }}>Ny</span>
        </div>
        {UPCOMING.map((row, i) => {
          const staffPhoto: Record<string, string> = {
            "Marcus Holst": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
            "Emil Strand":  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
            "Sofia Krag":   "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
          };
          const photo = staffPhoto[row.barber];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 18px", borderBottom: i < UPCOMING.length - 1 ? "1px solid var(--border)" : "none" }}>
              {photo ? (
                <img src={photo} alt={row.barber} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-strong)" }}/>
              ) : (
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border-strong)", flexShrink: 0 }}/>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.service}</div>
                <div style={{ fontSize: "12px", color: "var(--gold)" }}>{row.barber}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>{row.date}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.time}</div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", flexShrink: 0 }}>Bekræftet</span>
            </div>
          );
        })}
        <div style={{ padding: "10px 18px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Demo — simulerede bookinger. I produktion vises dine rigtige aftaler her.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onBookAgain} style={{ background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          Book igen
        </button>
        <Link href="/kontrakt" style={{ background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Download kontrakt
        </Link>
        <Link href="/bookings" style={{ background: "var(--gold)", color: "#0E0C09", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
          Mine bookinger
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H6M11 3V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BookPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; email: string } | null>(null);
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("bf_session");
      if (!s) { router.replace("/"); return; }
      const p = JSON.parse(s); setSession(p); setClientName(p.name);
    } catch { router.replace("/"); }
  }, [router]);

  const slots = useMemo(() => {
    if (!date) return [];
    const taken = TAKEN_BY_DAY[date.getDay()] ?? [];
    return TIME_SLOTS.map((t, i) => ({ time: t, taken: taken.includes(i) }));
  }, [date]);

  const morningSlots   = useMemo(() => slots.filter(s => MORNING_SLOTS.includes(s.time)), [slots]);
  const afternoonSlots = useMemo(() => slots.filter(s => AFTERNOON_SLOTS.includes(s.time)), [slots]);
  const eveningSlots   = useMemo(() => slots.filter(s => EVENING_SLOTS.includes(s.time)), [slots]);

  function canProceed() {
    if (step === 1) return !!service; if (step === 2) return !!staffMember;
    if (step === 3) return !!date;    if (step === 4) return !!time;
    return true;
  }

  function handleNext() {
    if (step < 5) { setStep(s => s + 1); return; }
    const newErrors: { name?: string; phone?: string } = {};
    if (!clientName.trim()) newErrors.name = "Feltet er påkrævet";
    if (clientPhone.trim()) {
      const digits = clientPhone.replace(/[\s\-+()]/g, "");
      if (!/^\d{8,}$/.test(digits)) newErrors.phone = "Ugyldigt telefonnummer";
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    try {
      const booking = { service: service!.name, staff: staffMember!.name, date: fmtDate(date!), time: time!, name: clientName, price: service!.price, createdAt: Date.now() };
      const existing = JSON.parse(sessionStorage.getItem("bf_bookings") ?? "[]");
      sessionStorage.setItem("bf_bookings", JSON.stringify([booking, ...existing]));
    } catch {}
    setConfirmed(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFlow() {
    setStep(1); setConfirmed(false);
    setService(null); setStaffMember(null); setDate(null); setTime(null);
    setClientName(session?.name ?? ""); setClientPhone(""); setNotes("");
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, height: "58px",
        background: "rgba(14,12,9,0.96)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 100,
      }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.01em" }}>Nordklip</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", borderLeft: "1px solid var(--border)", paddingLeft: "10px" }}>Book</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/bookings" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, textDecoration: "none" }}>Mine bookinger</Link>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name}</span>
          <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)",
            borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>Log ud</button>
        </div>
      </nav>

      {/* Hero header */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid var(--border)",
        minHeight: "160px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Background photo */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&fit=crop&crop=center)",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}/>
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,12,9,0.72) 0%, rgba(14,12,9,0.88) 100%)",
        }}/>
        {/* Content */}
        <div style={{ position: "relative", width: "100%", padding: "36px 48px" }}>
          <h1 className="serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Book en tid</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nordklip Barbershop &mdash; Kongensgade 14, K&oslash;benhavn</p>
        </div>
      </div>

      <main style={{ padding: "28px 48px 80px" }}>
        <div style={{ width: "100%" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "clamp(28px, 4vw, 52px)" }}>
              {confirmed ? (
                <ConfirmScreen service={service!} staffMember={staffMember!} date={date!} time={time!}
                  clientName={clientName} clientEmail={session.email} onBookAgain={resetFlow}/>
              ) : (
                <>
                  <Steps current={step}/>
                  <div style={{ minHeight: "280px" }}>

                    {/* ── STEP 1 — Service ──────────────────────── */}
                    {step === 1 && (
                      <>
                        <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Vælg en ydelse</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Hvad skal du have lavet i dag?</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {SERVICES.map(s => {
                            const sel = service?.id === s.id;
                            return (
                              <button key={s.id} onClick={() => setService(s)} style={{
                                width: "100%", textAlign: "left",
                                background: sel ? "var(--gold-dim)" : "var(--surface-2)",
                                border: `1px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                borderLeft: `3px solid ${sel ? "var(--gold)" : "transparent"}`,
                                borderRadius: "9px", padding: "20px 22px",
                                cursor: "pointer", transition: "all 0.15s",
                                display: "flex", alignItems: "center", gap: "14px",
                              }}>
                                {/* Photo */}
                                <div style={{
                                  width: "80px", height: "80px", borderRadius: "8px", flexShrink: 0,
                                  overflow: "hidden",
                                  border: `1px solid ${sel ? "var(--gold-border)" : "var(--border-strong)"}`,
                                  transition: "border-color 0.15s",
                                }}>
                                  {s.photo && <img src={s.photo} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                                    <span className="serif" style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>{s.name}</span>
                                    <span style={{ fontSize: "10px", color: sel ? "var(--gold)" : "var(--text-muted)", background: sel ? "rgba(184,152,90,0.1)" : "var(--surface)", border: `1px solid ${sel ? "var(--gold-border)" : "var(--border)"}`, borderRadius: "3px", padding: "1px 6px", fontWeight: 600, letterSpacing: "0.04em" }}>{s.category}</span>
                                    {s.popular && <span style={{ fontSize: "10px", color: "#FBBF24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.28)", borderRadius: "3px", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.04em" }}>Populær</span>}
                                    {s.badge && <span style={{ fontSize: "10px", color: "#7BA3C4", background: "rgba(123,163,196,0.1)", border: "1px solid rgba(123,163,196,0.28)", borderRadius: "3px", padding: "1px 6px", fontWeight: 600 }}>{s.badge}</span>}
                                  </div>
                                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                                </div>

                                {/* Duration + Price */}
                                <div style={{ flexShrink: 0, textAlign: "right" }}>
                                  <div className="serif" style={{ fontSize: "20px", fontWeight: 700, color: sel ? "var(--gold)" : "var(--text)", marginBottom: "3px" }}>{s.price} kr.</div>
                                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{s.duration} min</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* ── STEP 2 — Staff ────────────────────────── */}
                    {step === 2 && (
                      <>
                        <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Vælg din barber</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: service?.id === "color-style" ? "10px" : "20px" }}>Alle vores barberer har deres eget fokus og stil.</p>
                        {service?.id === "color-style" && (
                          <div style={{ background: "rgba(196,155,191,0.06)", border: "1px solid rgba(196,155,191,0.22)", borderRadius: "7px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="6.5" stroke="rgba(196,155,191,0.7)" strokeWidth="1.2"/><path d="M8 5.5v3.5M8 11v.5" stroke="rgba(196,155,191,0.7)" strokeWidth="1.4" strokeLinecap="round"/></svg>
                            <p style={{ fontSize: "12px", color: "rgba(196,155,191,0.85)", margin: 0, lineHeight: 1.5 }}>Sofia er vores eneste farvespecialist og tager sig af din farvning.</p>
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {STAFF.filter(s => service?.id === "color-style" ? s.id === "sofia" || s.id === "any" : true).map(s => {
                            const sel = staffMember?.id === s.id;
                            const isAny = s.id === "any";
                            return (
                              <button key={s.id} onClick={() => setStaffMember(s)} style={{
                                width: "100%", textAlign: "left",
                                background: sel ? "var(--gold-dim)" : "var(--surface-2)",
                                border: `1px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                borderRadius: "10px", padding: "0",
                                cursor: "pointer", transition: "all 0.15s", overflow: "hidden",
                              }}>
                                {/* Top accent line */}
                                <div style={{ height: "2px", background: sel ? `linear-gradient(90deg, var(--gold), transparent)` : "transparent", transition: "background 0.15s" }}/>

                                <div style={{ padding: "22px 26px" }}>
                                  {isAny ? (
                                    /* "No preference" card */
                                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                                      <div style={{
                                        width: "62px", height: "62px", borderRadius: "50%", flexShrink: 0,
                                        background: "var(--surface)", border: `2px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                      }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? "var(--gold)" : "var(--text-muted)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "3px", fontFamily: "var(--font-playfair)" }}>{s.name}</div>
                                        <div style={{ fontSize: "13px", color: sel ? "var(--gold)" : "var(--text-muted)" }}>{s.role}</div>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>{s.story}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Real barber card */
                                    <>
                                      <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", marginBottom: "16px" }}>
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                          <img src={s.photo} alt={s.name} style={{
                                            width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover",
                                            border: `2px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                            display: "block", transition: "border-color 0.15s",
                                          }}/>
                                          <div style={{
                                            position: "absolute", bottom: "2px", right: "2px",
                                            width: "13px", height: "13px", borderRadius: "50%",
                                            background: "#4ade80", border: "2px solid var(--surface-2)",
                                          }}/>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div className="serif" style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>{s.name}</div>
                                          <div style={{ fontSize: "13px", color: sel ? "var(--gold)" : "var(--text-muted)", fontWeight: 600, marginBottom: "3px" }}>{s.role}</div>
                                          <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            {s.experience} erfaring
                                          </div>
                                        </div>
                                      </div>

                                      {/* Story */}
                                      <p style={{
                                        fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65,
                                        margin: "0 0 14px", paddingTop: "14px",
                                        borderTop: `1px solid ${sel ? "var(--gold-border)" : "var(--border)"}`,
                                      }}>{s.story}</p>

                                      {/* Tags */}
                                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                        {s.tags.map(tag => (
                                          <span key={tag} style={{
                                            fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em",
                                            color: sel ? "var(--gold)" : "var(--text-muted)",
                                            background: sel ? "rgba(184,152,90,0.1)" : "var(--surface)",
                                            border: `1px solid ${sel ? "var(--gold-border)" : "var(--border)"}`,
                                            borderRadius: "4px", padding: "2px 8px",
                                          }}>{tag}</span>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* ── STEP 3 — Date ─────────────────────────── */}
                    {step === 3 && (
                      <>
                        <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Vælg en dato</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>De næste to ugers ledige tider.</p>
                        <div style={{ maxWidth: "560px" }}>
                          <CalendarPicker selected={date} onSelect={d => { setDate(d); setTime(null); }}/>
                        </div>
                      </>
                    )}

                    {/* ── STEP 4 — Time ─────────────────────────── */}
                    {step === 4 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                          <div>
                            <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Vælg et tidspunkt</h2>
                            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{date ? fmtDate(date) : ""}</p>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--gold-dim)", border: "1px solid var(--gold)", display: "inline-block" }}/>Ledig
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "inline-block", opacity: 0.4 }}/>Optaget
                            </span>
                          </div>
                        </div>
                        <TimeGroup label="Formiddag"   slots={morningSlots}   selected={time} onSelect={setTime}/>
                        <TimeGroup label="Eftermiddag" slots={afternoonSlots} selected={time} onSelect={setTime}/>
                        <TimeGroup label="Aften"        slots={eveningSlots}   selected={time} onSelect={setTime}/>
                      </>
                    )}

                    {/* ── STEP 5 — Details ──────────────────────── */}
                    {step === 5 && (
                      <>
                        <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Dine oplysninger</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Næsten færdig. Bekræft blot dine kontaktoplysninger.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "24px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                              Fulde navn <span style={{ color: "var(--red)" }}>*</span>
                            </label>
                            <input type="text" placeholder="Dit navn" value={clientName}
                              onChange={e => { setClientName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                              style={errors.name ? { borderColor: "var(--red)" } : {}}/>
                            {errors.name && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px" }}>{errors.name}</p>}
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                              Telefon <span style={{ fontWeight: 400, textTransform: "none" as const, color: "var(--text-muted)" }}>valgfrit</span>
                            </label>
                            <input type="tel" placeholder="+45 12 34 56 78" value={clientPhone}
                              onChange={e => { setClientPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                              style={errors.phone ? { borderColor: "#DC2626" } : {}}/>
                            {errors.phone && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{errors.phone}</p>}
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                              Bemærkninger <span style={{ fontWeight: 400, textTransform: "none" as const, color: "var(--text-muted)" }}>valgfrit</span>
                            </label>
                            <textarea placeholder="Særlige ønsker eller præferencer..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "vertical" }}/>
                          </div>
                        </div>
                        {/* Summary */}
                        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderLeft: "3px solid var(--gold)", borderRadius: "8px", overflow: "hidden" }}>
                          <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", background: "rgba(184,152,90,0.04)" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-muted)" }}>Oversigt</span>
                          </div>
                          {[["Ydelse", service?.name ?? ""], ["Barber", staffMember?.name ?? ""], ["Dato", date ? fmtDate(date) : ""], ["Tidspunkt", time ?? ""], ["Pris", service?.price ? `${service.price} kr.` : ""]].map(([l, v], idx, arr) => (
                            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{l}</span>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: l === "Pris" ? "var(--gold)" : "var(--text)", fontFamily: l === "Ydelse" ? "var(--font-playfair)" : "inherit" }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{
                      background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)",
                      borderRadius: "6px", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
                      cursor: step === 1 ? "default" : "pointer", opacity: step === 1 ? 0.3 : 1,
                    }}>Tilbage</button>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.04em" }}>Trin {step} af 5</span>
                    <button onClick={handleNext} disabled={!canProceed()} style={{
                      background: canProceed() ? "var(--gold)" : "var(--surface-2)",
                      border: "none", color: canProceed() ? "#0E0C09" : "var(--text-muted)",
                      borderRadius: "6px", padding: "10px 26px", fontSize: "14px", fontWeight: 700,
                      cursor: canProceed() ? "pointer" : "default", transition: "all 0.15s",
                      boxShadow: canProceed() ? "0 4px 20px var(--gold-glow)" : "none",
                    }}>
                      {step === 5 ? "Bekræft booking" : "Fortsæt"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Bygget af Sloth Studio
            </a>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "3px", padding: "1px 6px" }}>Demo</span>
          </div>
        </div>
      </main>
    </div>
  );
}
