"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { OwnerSidebar } from "../components/OwnerSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appt {
  id: string;
  dayOffset: number;
  time: string;
  service: string;
  barber: string;
  duration: number;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  appointments: Appt[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A",  "Farve & Stil": "#C49BBF",
};

const BARBER_PHOTOS: Record<string, string> = {
  "Marcus": "https://images.pexels.com/photos/30004312/pexels-photo-30004312.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop&crop=face",
  "Emil":   "https://images.pexels.com/photos/30004318/pexels-photo-30004318.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop&crop=face",
  "Sofia":  "https://images.pexels.com/photos/30004322/pexels-photo-30004322.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop&crop=face",
};

const BARBERS = ["Marcus", "Emil", "Sofia"];
const MONTHS_DA = ["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"];
const DOW_DA = ["Ma","Ti","On","To","Fr","Lø","Sø"];

const INIT_CUSTOMERS: Customer[] = [
  { id: "1", name: "Henrik Bruun",       phone: "+45 22 34 56 78", appointments: [
    { id: "a1", dayOffset: -1, time: "13:00", service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
    { id: "a2", dayOffset:  0, time: "09:00", service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
  ]},
  { id: "2", name: "Maja Lindström",     phone: "+45 28 12 34 90", appointments: [
    { id: "b1", dayOffset:  0, time: "10:00", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
  ]},
  { id: "3", name: "Lars Thomsen",       phone: "+45 40 87 65 43", appointments: [
    { id: "c1", dayOffset: -1, time: "14:00", service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { id: "c2", dayOffset:  0, time: "11:30", service: "Classic Cut",     barber: "Emil",   duration: 45 },
  ]},
  { id: "4", name: "Oliver Brink",       phone: "+45 31 22 44 55", appointments: [
    { id: "d1", dayOffset:  0, time: "13:00", service: "Cut & Beard",     barber: "Marcus", duration: 70 },
    { id: "d2", dayOffset:  3, time: "13:00", service: "Cut & Beard",     barber: "Marcus", duration: 70 },
  ]},
  { id: "5", name: "Stine Krogh",        phone: "+45 51 99 88 77", appointments: [
    { id: "e1", dayOffset:  0, time: "14:30", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { id: "e2", dayOffset:  2, time: "14:00", service: "Farve & Stil",    barber: "Sofia",  duration: 90, notes: "Ønsker balayage" },
  ]},
  { id: "6", name: "Adam Schäfer",       phone: "+45 27 33 11 99", appointments: [
    { id: "f1", dayOffset: -1, time: "17:00", service: "Cut & Beard",     barber: "Marcus", duration: 70 },
    { id: "f2", dayOffset:  0, time: "15:30", service: "Cut & Beard",     barber: "Emil",   duration: 70 },
  ]},
  { id: "7", name: "Jesper Winther",     phone: "+45 60 44 22 11", appointments: [
    { id: "g1", dayOffset:  0, time: "17:00", service: "Classic Cut",     barber: "Marcus", duration: 45 },
    { id: "g2", dayOffset:  3, time: "17:00", service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ]},
  { id: "8", name: "Casper Møller",      phone: "+45 41 55 77 33", appointments: [
    { id: "h1", dayOffset:  0, time: "09:00", service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ]},
  { id: "9", name: "Erik Svendsen",      phone: "+45 23 88 99 00", appointments: [
    { id: "i1", dayOffset:  0, time: "10:00", service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
    { id: "i2", dayOffset:  2, time: "11:30", service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
  ]},
  { id: "10", name: "Laura Winther",     phone: "+45 52 66 44 88", appointments: [
    { id: "j1", dayOffset:  0, time: "10:30", service: "Farve & Stil",    barber: "Sofia",  duration: 90, notes: "Fuld highlights, lappetest udført" },
    { id: "j2", dayOffset:  4, time: "10:00", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
  ]},
  { id: "11", name: "Viktor Hansen",     phone: "+45 30 21 43 65", appointments: [
    { id: "k1", dayOffset:  0, time: "11:00", service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ]},
  { id: "12", name: "Frederik Lund",     phone: "+45 44 32 10 98", appointments: [
    { id: "l1", dayOffset:  0, time: "11:30", service: "Cut & Beard",     barber: "Emil",   duration: 70 },
    { id: "l2", dayOffset:  1, time: "12:00", service: "Classic Cut",     barber: "Emil",   duration: 45 },
  ]},
  { id: "13", name: "Nikolaj Borg",      phone: "+45 61 77 55 44", appointments: [
    { id: "m1", dayOffset:  1, time: "13:00", service: "Hot Towel Shave", barber: "Marcus", duration: 40 },
  ]},
  { id: "14", name: "Anna Kristiansen",  phone: "+45 26 54 32 10", appointments: [
    { id: "n1", dayOffset:  1, time: "14:00", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
    { id: "n2", dayOffset:  4, time: "11:00", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
  ]},
  { id: "15", name: "Søren Bang",        phone: "+45 42 11 33 77", appointments: [
    { id: "o1", dayOffset:  2, time: "10:00", service: "Classic Cut",     barber: "Marcus", duration: 45 },
  ]},
  { id: "16", name: "Ida Markussen",     phone: "+45 53 99 11 22", appointments: [
    { id: "p1", dayOffset:  2, time: "10:30", service: "Farve & Stil",    barber: "Sofia",  duration: 90 },
  ]},
  { id: "17", name: "Patrick Steen",     phone: "+45 29 44 88 55", appointments: [
    { id: "q1", dayOffset:  2, time: "11:30", service: "Beard Sculpt",    barber: "Emil",   duration: 30 },
  ]},
  { id: "18", name: "Daniel Westh",      phone: "+45 71 22 66 44", appointments: [
    { id: "r1", dayOffset:  1, time: "14:30", service: "Classic Cut",     barber: "Emil",   duration: 45 },
    { id: "r2", dayOffset:  3, time: "14:30", service: "Classic Cut",     barber: "Emil",   duration: 45 },
  ]},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dayLabel(offset: number) {
  if (offset === 0) return "I dag";
  if (offset === 1) return "I morgen";
  if (offset === -1) return "I går";
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
}

function dateToOffset(date: Date): number {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function isValidTime(t: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [viewYear, setViewYear]   = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());

  const firstDow    = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const canGoPrev   = new Date(viewYear, viewMonth, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ width: "100%" }}>
      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <button onClick={prevMonth} disabled={!canGoPrev} style={{
          background: "transparent", border: "1px solid var(--border-strong)", borderRadius: "6px",
          width: "28px", height: "28px", cursor: canGoPrev ? "pointer" : "default",
          color: canGoPrev ? "var(--text-secondary)" : "rgba(245,239,228,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 2L3 5l4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
          {MONTHS_DA[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{
          background: "transparent", border: "1px solid var(--border-strong)", borderRadius: "6px",
          width: "28px", height: "28px", cursor: "pointer", color: "var(--text-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
        {DOW_DA.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", padding: "4px 0", letterSpacing: "0.04em" }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>;
          const date = new Date(viewYear, viewMonth, day); date.setHours(0,0,0,0);
          const isPast     = date < today;
          const isToday    = date.toDateString() === today.toDateString();
          const isSelected = selected && date.toDateString() === selected.toDateString();
          return (
            <button key={i} onClick={() => !isPast && onSelect(date)} style={{
              padding: "7px 0", textAlign: "center", borderRadius: "5px",
              background: isSelected ? "var(--gold)" : isToday ? "var(--gold-dim)" : "transparent",
              border: `1px solid ${isSelected ? "transparent" : isToday ? "var(--gold-border)" : "transparent"}`,
              color: isSelected ? "#0E0C09" : isPast ? "rgba(245,239,228,0.18)" : isToday ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "12px", fontWeight: isSelected || isToday ? 700 : 400,
              cursor: isPast ? "default" : "pointer", transition: "all 0.1s",
            }}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onConfirm }: {
  appt: Appt;
  onClose: () => void;
  onConfirm: (newOffset: number, newTime: string, newBarber: string) => void;
}) {
  const initDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + Math.max(0, appt.dayOffset)); d.setHours(0,0,0,0); return d;
  }, [appt.dayOffset]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initDate);
  const [time, setTime]     = useState(appt.time);
  const [barber, setBarber] = useState(appt.barber);
  const [saved, setSaved]   = useState(false);
  const [timeError, setTimeError] = useState(false);

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/[^0-9:]/g, "");
    if (v.length === 2 && !v.includes(":") && time.length < 2) v = v + ":";
    if (v.length <= 5) setTime(v);
    setTimeError(false);
  }

  function handleConfirm() {
    if (!selectedDate) return;
    if (!isValidTime(time)) { setTimeError(true); return; }
    setSaved(true);
    setTimeout(() => { onConfirm(dateToOffset(selectedDate), time, barber); }, 700);
  }

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })
    : "Vælg dato";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-inner" style={{
        background: "var(--surface)", border: "1px solid var(--border-strong)",
        borderRadius: "14px", width: "100%", maxWidth: "500px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)", overflow: "hidden",
        maxHeight: "90dvh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>Flyt aftale</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
              {appt.service} · {dayLabel(appt.dayOffset)} kl. {appt.time}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "6px", cursor: "pointer", color: "var(--text-secondary)", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* Calendar */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Ny dato</div>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "10px", padding: "14px 16px" }}>
              <CalendarPicker selected={selectedDate} onSelect={setSelectedDate}/>
            </div>
            {selectedDate && (
              <div style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, marginTop: "8px" }}>
                Valgt: {formattedDate}
              </div>
            )}
          </div>

          {/* Time input */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Ny tid</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="text"
                value={time}
                onChange={handleTimeChange}
                onBlur={() => setTimeError(time.length > 0 && !isValidTime(time))}
                placeholder="09:00"
                maxLength={5}
                style={{
                  width: "90px", padding: "10px 14px",
                  background: "var(--surface-2)",
                  border: `1px solid ${timeError ? "#ef4444" : "var(--gold-border)"}`,
                  borderRadius: "8px", color: "var(--text)", fontSize: "20px",
                  fontFamily: "var(--font-playfair)", fontWeight: 700, textAlign: "center",
                  letterSpacing: "0.06em", outline: "none",
                }}
              />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {timeError ? <span style={{ color: "#ef4444" }}>Skriv format HH:MM (f.eks. 14:30)</span> : "Skriv hvad som helst — f.eks. 14:30"}
              </span>
            </div>
          </div>

          {/* Barber selector */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Barber</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {BARBERS.map(b => (
                <button key={b} onClick={() => setBarber(b)} style={{
                  flex: 1, padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
                  background: barber === b ? "var(--gold-dim)" : "var(--surface-2)",
                  border: `1px solid ${barber === b ? "var(--gold-border)" : "var(--border-strong)"}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.12s",
                }}>
                  <img src={BARBER_PHOTOS[b]} alt={b} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", opacity: barber === b ? 1 : 0.55 }}/>
                  <span style={{ fontSize: "11px", fontWeight: barber === b ? 700 : 500, color: barber === b ? "var(--gold)" : "var(--text-secondary)" }}>{b}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", paddingTop: "2px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px", background: "var(--surface-2)",
              border: "1px solid var(--border-strong)", borderRadius: "8px",
              color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}>Luk</button>
            <button onClick={handleConfirm} disabled={saved || !selectedDate} style={{
              flex: 2, padding: "12px",
              background: saved ? "rgba(74,222,128,0.12)" : !selectedDate ? "var(--surface-2)" : "var(--gold)",
              border: `1px solid ${saved ? "rgba(74,222,128,0.3)" : !selectedDate ? "var(--border)" : "transparent"}`,
              borderRadius: "8px",
              color: saved ? "#4ade80" : !selectedDate ? "var(--text-muted)" : "#0E0C09",
              fontSize: "13px", fontWeight: 700,
              cursor: saved || !selectedDate ? "default" : "pointer", transition: "all 0.2s",
            }}>
              {saved ? "Aftale flyttet" : selectedDate ? `Bekræft — kl. ${time}` : "Vælg en dato"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ customer, onReschedule, onCancel }: {
  customer: Customer;
  onReschedule: (apptId: string) => void;
  onCancel: (apptId: string) => void;
}) {
  const [open, setOpen]           = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const upcoming = customer.appointments.filter(a => a.dayOffset >= 0).sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time));
  const past     = customer.appointments.filter(a => a.dayOffset < 0);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px", overflow: "hidden" }}>
      {/* Header row */}
      <div onClick={() => setOpen(o => !o)} className="customer-header" style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: "16px" }}>
        {/* Initials avatar */}
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
          background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--gold)",
        }}>
          {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{customer.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{customer.phone}</div>
        </div>

        <div className="customer-badges" style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
          {upcoming.length > 0 && (
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "4px", padding: "2px 8px" }}>
              {upcoming.length} kommende
            </span>
          )}
          {past.length > 0 && (
            <span style={{ fontSize: "10px", color: "var(--text-secondary)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "4px", padding: "2px 8px" }}>
              {past.length} tidligere
            </span>
          )}
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style={{ color: "var(--text-secondary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Expanded appointments */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {customer.appointments.length === 0 ? (
            <div style={{ padding: "20px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>Ingen aftaler.</div>
          ) : (
            [...customer.appointments]
              .sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time))
              .map((appt, i, arr) => {
                const isPast = appt.dayOffset < 0;
                const color  = SVC_COLOR[appt.service] || "#B8985A";
                const isCancelling = cancellingId === appt.id;

                return (
                  <div key={appt.id} className="appt-row" style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 20px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    background: isPast ? "rgba(0,0,0,0.12)" : "transparent",
                    opacity: isPast ? 0.5 : 1,
                  }}>
                    {/* Day + time block */}
                    <div style={{ flexShrink: 0, textAlign: "center", minWidth: "68px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: isPast ? "var(--text-muted)" : "var(--gold)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{dayLabel(appt.dayOffset)}</div>
                      <div style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: 700, color: isPast ? "var(--text-muted)" : "var(--text)", lineHeight: 1.1, marginTop: "2px" }}>{appt.time}</div>
                    </div>

                    {/* Service + barber */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }}/>
                        <span style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{appt.service}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· {appt.duration} min</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <img src={BARBER_PHOTOS[appt.barber]} alt={appt.barber} style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover" }}/>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{appt.barber}</span>
                        {appt.notes && <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>· {appt.notes}</span>}
                      </div>
                    </div>

                    {/* Actions — only for future appointments */}
                    {!isPast && (
                      <div className="appt-actions" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        {isCancelling ? (
                          <div className="appt-confirm-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Er du sikker?</span>
                            <button onClick={() => { onCancel(appt.id); setCancellingId(null); }} style={{
                              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
                              borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 700,
                              color: "#f87171", cursor: "pointer",
                            }}>Ja</button>
                            <button onClick={() => setCancellingId(null)} style={{
                              background: "var(--surface-2)", border: "1px solid var(--border-strong)",
                              borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 500,
                              color: "var(--text-secondary)", cursor: "pointer",
                            }}>Behold</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => onReschedule(appt.id)} style={{
                              background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
                              borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: 700,
                              color: "var(--gold)", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: "5px", transition: "all 0.12s",
                            }}>
                              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M1 7a6 6 0 1 0 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M1 3v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Flyt
                            </button>
                            <button onClick={() => setCancellingId(appt.id)} style={{
                              background: "transparent", border: "1px solid var(--border-strong)",
                              borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 500,
                              color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.12s",
                            }}>Annuller</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }: { onAuth: () => void }) {
  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner")) { onAuth(); } } catch {}
  }, [onAuth]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", color: "var(--gold)", marginBottom: "12px" }}>Nordklip</div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Log ind som ejer for at se kunder.</p>
        <Link href="/owner" style={{
          display: "inline-block", background: "var(--gold)", color: "#0E0C09",
          borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, textDecoration: "none",
        }}>Gå til ejeroversigt</Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KunderPage() {
  const [authed, setAuthed]             = useState(false);
  const [checking, setChecking]         = useState(true);
  const [customers, setCustomers]       = useState<Customer[]>(INIT_CUSTOMERS);
  const [search, setSearch]             = useState("");
  const [rescheduling, setRescheduling] = useState<{ customerId: string; apptId: string } | null>(null);
  const [flashId, setFlashId]           = useState<string | null>(null);

  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner")) setAuthed(true); } catch {}
    setChecking(false);
  }, []);

  function handleLogout() {
    try { sessionStorage.removeItem("bf_owner"); } catch {}
    window.location.href = "/owner";
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.appointments.some(a => a.service.toLowerCase().includes(q) || a.barber.toLowerCase().includes(q))
    );
  }, [customers, search]);

  function handleReschedule(customerId: string, apptId: string, newOffset: number, newTime: string, newBarber: string) {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return { ...c, appointments: c.appointments.map(a => a.id === apptId ? { ...a, dayOffset: newOffset, time: newTime, barber: newBarber } : a) };
    }));
    setRescheduling(null);
    setFlashId(apptId);
    setTimeout(() => setFlashId(null), 2000);
  }

  function handleCancel(customerId: string, apptId: string) {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return { ...c, appointments: c.appointments.filter(a => a.id !== apptId) };
    }));
  }

  if (checking) return null;
  if (!authed) return <AuthGate onAuth={() => setAuthed(true)}/>;

  const reschedulingAppt = rescheduling
    ? customers.find(c => c.id === rescheduling.customerId)?.appointments.find(a => a.id === rescheduling.apptId)
    : null;

  const totalApts     = customers.reduce((s, c) => s + c.appointments.length, 0);
  const upcomingTotal = customers.reduce((s, c) => s + c.appointments.filter(a => a.dayOffset >= 0).length, 0);

  return (
    <div className="sidebar-wrapper" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <OwnerSidebar onLogout={handleLogout}/>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(14,12,9,0.92)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Kunder</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{filtered.length} kunder · {upcomingTotal} kommende aftaler</p>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[ { label: "Kunder i alt", val: customers.length }, { label: "Aftaler i alt", val: totalApts }, { label: "Kommende", val: upcomingTotal } ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <main style={{ padding: "24px 32px 80px", flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: "20px", maxWidth: "440px" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Søg navn, telefon, ydelse..." value={search} onChange={e => setSearch(e.target.value)} style={{
              width: "100%", padding: "10px 12px 10px 34px",
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "8px", color: "var(--text)", fontSize: "13px", outline: "none", boxSizing: "border-box",
            }}/>
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Ingen kunder matcher "{search}".</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map(c => (
                <div key={c.id} style={{ outline: flashId && c.appointments.some(a => a.id === flashId) ? "1px solid rgba(74,222,128,0.5)" : "none", borderRadius: "10px", transition: "outline 0.3s" }}>
                  <CustomerCard
                    customer={c}
                    onReschedule={apptId => setRescheduling({ customerId: c.id, apptId })}
                    onCancel={apptId => handleCancel(c.id, apptId)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Bygget af Sloth Studio</a>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduling && reschedulingAppt && (
        <RescheduleModal
          appt={reschedulingAppt}
          onClose={() => setRescheduling(null)}
          onConfirm={(newOffset, newTime, newBarber) =>
            handleReschedule(rescheduling.customerId, rescheduling.apptId, newOffset, newTime, newBarber)
          }
        />
      )}
    </div>
  );
}
