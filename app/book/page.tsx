"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service { id: string; name: string; duration: number; price: number; desc: string; }
interface StaffMember { id: string; name: string; role: string; note: string; initials: string; photo?: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  { id: "classic-cut",  name: "Classic Cut",     duration: 30, price: 35,  desc: "Scissor & clipper cut, styled to finish" },
  { id: "beard-sculpt", name: "Beard Sculpt",    duration: 20, price: 20,  desc: "Line-up, shaping, and beard balm finish" },
  { id: "cut-beard",    name: "Cut & Beard",     duration: 45, price: 50,  desc: "Full haircut + complete beard treatment" },
  { id: "hot-towel",    name: "Hot Towel Shave", duration: 30, price: 28,  desc: "Traditional straight-razor shave with hot towel" },
];

const STAFF: StaffMember[] = [
  { id: "oliver", name: "Oliver Berg",   role: "Senior Stylist",  note: "Taper fades and classic cuts",       initials: "OB", photo: "https://i.pravatar.cc/120?img=68" },
  { id: "marcus", name: "Marcus Lund",   role: "Master Barber",   note: "Precise beard sculpting",            initials: "ML", photo: "https://i.pravatar.cc/120?img=57" },
  { id: "emil",   name: "Emil Dahl",     role: "Barber",          note: "Modern textured styles and fades",   initials: "ED", photo: "https://i.pravatar.cc/120?img=13" },
  { id: "any",    name: "No preference", role: "First available", note: "We assign the best available",       initials: "--" },
];

const TAKEN_BY_DAY: Record<number, number[]> = {
  1: [1, 4, 9], 2: [3, 6, 11], 3: [0, 5, 8], 4: [2, 7, 10], 5: [1, 5, 9], 6: [4, 6, 8],
};

const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];
const STEP_LABELS = ["Service","Staff","Date","Time","Details"];

const UPCOMING = [
  { name: "Marcus Holst", service: "Classic Cut",     date: "Tomorrow",    time: "10:30", barber: "Oliver Berg" },
  { name: "Emil Strand",  service: "Beard Sculpt",    date: "Thu 20 Mar",  time: "14:00", barber: "Marcus Lund" },
  { name: "Sofia Krag",   service: "Cut & Beard",     date: "Fri 21 Mar",  time: "11:00", barber: "Emil Dahl"   },
  { name: "Marcus Holst", service: "Hot Towel Shave", date: "Sat 22 Mar",  time: "13:30", barber: "Oliver Berg" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: Date) { return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function getAvailDates() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dates: Date[] = [];
  for (let i = 1; i <= 21; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
    if (dates.length === 14) break;
  }
  return dates;
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
                background: done || active ? "var(--gold)" : "var(--surface-2)",
                border: done || active ? "2px solid var(--gold)" : "2px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: active ? "0 0 18px var(--gold-glow)" : "none",
              }}>
                {done ? <Check size={13} color="#0E0C09"/> : (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "#0E0C09" : "var(--text-muted)", lineHeight: 1 }}>{n}</span>
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

// ─── Date Picker ──────────────────────────────────────────────────────────────
function DatePicker({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const dates = useMemo(() => getAvailDates(), []);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "8px" }}>
      {dates.map((d, i) => {
        const sel = selected?.getTime() === d.getTime();
        return (
          <button key={i} onClick={() => onSelect(d)} style={{
            background: sel ? "var(--gold-dim)" : "var(--surface-2)",
            border: `1px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
            borderRadius: "6px", padding: "12px 8px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", transition: "all 0.12s",
          }}>
            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: sel ? "var(--gold)" : "var(--text-muted)" }}>
              {d.toLocaleDateString("en", { weekday: "short" })}
            </span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: sel ? "var(--gold)" : "var(--text)", lineHeight: 1.1 }}>
              {d.getDate()}
            </span>
            <span style={{ fontSize: "10px", color: sel ? "var(--gold-border)" : "var(--text-muted)" }}>
              {d.toLocaleDateString("en", { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────
function ConfirmScreen({ service, staffMember, date, time, clientName, clientEmail, onBookAgain }: {
  service: Service; staffMember: StaffMember; date: Date; time: string;
  clientName: string; clientEmail: string; onBookAgain: () => void;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{
          width: "58px", height: "58px", borderRadius: "50%",
          background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", boxShadow: "0 0 32px var(--gold-glow)",
        }}>
          <Check size={24} color="var(--gold)"/>
        </div>
        <h2 className="serif" style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Booking confirmed
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Confirmation sent to <span style={{ color: "var(--text-secondary)" }}>{clientEmail}</span>
        </p>
      </div>

      {/* Booking summary */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)" }}/>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Your appointment</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "16px 18px", gap: "14px" }}>
          {[["Service", service.name], ["Price", `€${service.price}`], ["Barber", staffMember.name], ["Duration", `${service.duration} min`], ["Date", fmtDate(date)], ["Time", time]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "3px", fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming table */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            Upcoming at Nordklip
          </span>
          <Link href="/bookings" style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600 }}>View all</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", padding: "11px 18px", borderBottom: "1px solid var(--border)", background: "rgba(184,152,90,0.04)" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{clientName}</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{service.name}</span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{fmtDate(date)}, {time}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>New</span>
        </div>
        {UPCOMING.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", padding: "11px 18px", borderBottom: i < UPCOMING.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ fontSize: "13px", color: "var(--text)" }}>{row.name}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.service}</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{row.date}, {row.time}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirmed</span>
          </div>
        ))}
        <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Demo — these are simulated bookings. In production your real appointments appear here.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onBookAgain} style={{ background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          Book another
        </button>
        <Link href="/bookings" style={{ background: "var(--gold)", color: "#0E0C09", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 700, display: "inline-block" }}>
          My bookings
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
  const [errors, setErrors] = useState<{ name?: string }>({});

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

  function canProceed() {
    if (step === 1) return !!service; if (step === 2) return !!staffMember;
    if (step === 3) return !!date;    if (step === 4) return !!time;
    return true;
  }

  function handleNext() {
    if (step < 5) { setStep(s => s + 1); return; }
    if (!clientName.trim()) { setErrors({ name: "Name is required." }); return; }
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

  // Shared styles
  const cardSel = { background: "var(--gold-dim)", border: "1px solid var(--gold)" };
  const cardDef = { background: "var(--surface-2)", border: "1px solid var(--border-strong)" };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, height: "58px",
        background: "rgba(14,12,9,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 100,
      }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.01em" }}>
            Nordklip
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", borderLeft: "1px solid var(--border)", paddingLeft: "10px" }}>
            Book
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/bookings" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
            My bookings
          </Link>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name}</span>
          <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)",
            borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "28px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>
          <h1 className="serif" style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
            Book an appointment
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nordklip Barbershop &mdash; Copenhagen
          </p>
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: "28px 16px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "10px", overflow: "hidden",
          }}>
            <div style={{ padding: "clamp(24px, 4vw, 36px)" }}>
              {confirmed ? (
                <ConfirmScreen service={service!} staffMember={staffMember!} date={date!} time={time!}
                  clientName={clientName} clientEmail={session.email} onBookAgain={resetFlow}/>
              ) : (
                <>
                  <Steps current={step}/>
                  <div style={{ minHeight: "260px" }}>

                    {/* STEP 1 — Service */}
                    {step === 1 && <>
                      <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose a service</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>What are you coming in for?</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                        {SERVICES.map(s => {
                          const sel = service?.id === s.id;
                          return (
                            <button key={s.id} onClick={() => setService(s)} style={{
                              ...(sel ? cardSel : cardDef), borderRadius: "8px", padding: "0",
                              cursor: "pointer", textAlign: "left", overflow: "hidden", transition: "all 0.15s",
                            }}>
                              <div style={{ height: "2px", background: sel ? "var(--gold)" : "var(--border)" }}/>
                              <div style={{ padding: "16px 18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-playfair)" }}>{s.name}</span>
                                  <span style={{ fontSize: "15px", fontWeight: 800, color: sel ? "var(--gold)" : "var(--text)" }}>€{s.price}</span>
                                </div>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.4 }}>{s.desc}</p>
                                <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "3px", padding: "2px 7px" }}>{s.duration} min</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>}

                    {/* STEP 2 — Staff */}
                    {step === 2 && <>
                      <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose your barber</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Pick someone or let us assign the best available.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {STAFF.map(s => {
                          const sel = staffMember?.id === s.id;
                          return (
                            <button key={s.id} onClick={() => setStaffMember(s)} style={{
                              ...(sel ? cardSel : cardDef), borderRadius: "8px", padding: "18px",
                              cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                            }}>
                              {s.photo ? (
                                <img src={s.photo} alt={s.name} style={{
                                  width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover",
                                  marginBottom: "12px", display: "block",
                                  border: `2px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                  transition: "border-color 0.15s",
                                }}/>
                              ) : (
                                <div style={{
                                  width: "56px", height: "56px", borderRadius: "50%", marginBottom: "12px",
                                  background: "var(--surface-3)", border: `2px solid ${sel ? "var(--gold)" : "var(--border-strong)"}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "12px", fontWeight: 700, color: "var(--text-muted)",
                                }}>{s.initials}</div>
                              )}
                              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "2px", fontFamily: "var(--font-playfair)" }}>{s.name}</div>
                              <div style={{ fontSize: "12px", color: sel ? "var(--gold)" : "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>{s.role}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.note}</div>
                            </button>
                          );
                        })}
                      </div>
                    </>}

                    {/* STEP 3 — Date */}
                    {step === 3 && <>
                      <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose a date</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Available over the next two weeks. Sundays we are closed.</p>
                      <DatePicker selected={date} onSelect={d => { setDate(d); setTime(null); }}/>
                      {date && <p style={{ marginTop: "14px", fontSize: "13px", color: "var(--gold)", fontWeight: 600 }}>{fmtDate(date)} selected</p>}
                    </>}

                    {/* STEP 4 — Time */}
                    {step === 4 && <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                          <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose a time</h2>
                          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{date ? fmtDate(date) : ""}</p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--gold-dim)", border: "1px solid var(--gold)", display: "inline-block" }}/>
                            Open
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "inline-block", opacity: 0.4 }}/>
                            Taken
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: "7px" }}>
                        {slots.map(({ time: t, taken }) => {
                          const sel = time === t;
                          return (
                            <button key={t} onClick={() => !taken && setTime(t)} disabled={taken} style={{
                              background: sel ? "var(--gold-dim)" : taken ? "transparent" : "var(--surface-2)",
                              border: `1px solid ${sel ? "var(--gold)" : taken ? "var(--border)" : "var(--border-strong)"}`,
                              borderRadius: "5px", padding: "10px 8px", cursor: taken ? "default" : "pointer",
                              color: sel ? "var(--gold)" : taken ? "var(--text-muted)" : "var(--text)",
                              fontSize: "14px", fontWeight: sel ? 700 : 400,
                              textDecoration: taken ? "line-through" : "none",
                              opacity: taken ? 0.35 : 1, textAlign: "center", transition: "all 0.12s",
                            }}>{t}</button>
                          );
                        })}
                      </div>
                      <p style={{ marginTop: "14px", fontSize: "11px", color: "var(--text-muted)" }}>
                        Crossed-out slots are already booked.
                      </p>
                    </>}

                    {/* STEP 5 — Details */}
                    {step === 5 && <>
                      <h2 className="serif" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Your details</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Almost there. Just your contact info.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "24px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                            Full name <span style={{ color: "var(--red)" }}>*</span>
                          </label>
                          <input type="text" placeholder="Your name" value={clientName}
                            onChange={e => { setClientName(e.target.value); setErrors({}); }}
                            style={errors.name ? { borderColor: "var(--red)" } : {}}/>
                          {errors.name && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px" }}>{errors.name}</p>}
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                            Phone <span style={{ fontWeight: 400, textTransform: "none" as const }}>optional</span>
                          </label>
                          <input type="tel" placeholder="+45 12 34 56 78" value={clientPhone} onChange={e => setClientPhone(e.target.value)}/>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                            Notes <span style={{ fontWeight: 400, textTransform: "none" as const }}>optional</span>
                          </label>
                          <textarea placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "vertical" }}/>
                        </div>
                      </div>
                      {/* Summary */}
                      <div style={{ background: "var(--surface-2)", border: "1px solid var(--gold-border)", borderLeft: "2px solid var(--gold)", borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{ padding: "10px 15px", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-muted)" }}>Summary</span>
                        </div>
                        {[["Service", service?.name ?? ""], ["Barber", staffMember?.name ?? ""], ["Date", date ? fmtDate(date) : ""], ["Time", time ?? ""], ["Price", `€${service?.price ?? ""}`]].map(([l, v]) => (
                          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 15px", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{l}</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </>}
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{
                      background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)",
                      borderRadius: "5px", padding: "10px 20px", fontSize: "14px", fontWeight: 600,
                      cursor: step === 1 ? "default" : "pointer", opacity: step === 1 ? 0.3 : 1,
                    }}>Back</button>

                    <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{step} / 5</span>

                    <button onClick={handleNext} disabled={!canProceed()} style={{
                      background: canProceed() ? "var(--gold)" : "var(--surface-2)",
                      border: "none", color: canProceed() ? "#0E0C09" : "var(--text-muted)",
                      borderRadius: "5px", padding: "10px 26px", fontSize: "14px", fontWeight: 700,
                      cursor: canProceed() ? "pointer" : "default", transition: "all 0.15s",
                      boxShadow: canProceed() ? "0 4px 20px var(--gold-glow)" : "none",
                    }}>
                      {step === 5 ? "Confirm booking" : "Continue"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Built by Sloth Studio
            </a>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "3px", padding: "1px 6px" }}>Demo</span>
          </div>
        </div>
      </main>
    </div>
  );
}
