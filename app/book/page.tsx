"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  desc: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  note: string;
  initials: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: "classic-cut",  name: "Classic Cut",     duration: 30, price: 35,  desc: "Scissor & clipper cut, styled to finish" },
  { id: "beard-sculpt", name: "Beard Sculpt",    duration: 20, price: 20,  desc: "Line-up, shaping, and beard balm finish" },
  { id: "cut-beard",    name: "Cut & Beard",     duration: 45, price: 50,  desc: "Full haircut + complete beard treatment" },
  { id: "hot-towel",    name: "Hot Towel Shave", duration: 30, price: 28,  desc: "Traditional straight-razor shave with hot towel" },
];

const STAFF: StaffMember[] = [
  { id: "oliver", name: "Oliver Berg",   role: "Senior Stylist",  note: "Specialist in taper fades and classic cuts", initials: "OB" },
  { id: "marcus", name: "Marcus Lund",   role: "Master Barber",   note: "Known for precise beard sculpting",          initials: "ML" },
  { id: "emil",   name: "Emil Dahl",     role: "Barber",          note: "Modern textured styles and fades",           initials: "ED" },
  { id: "any",    name: "No preference", role: "First available", note: "We assign the best available barber",        initials: "--" },
];

// Slots pre-marked taken per weekday (day.getDay(): 1=Mon…6=Sat).
// In production you'd pull real availability from your database.
// Clients can configure which slots are blocked, how far in advance to allow bookings, etc.
const TAKEN_SLOTS_BY_DAY: Record<number, number[]> = {
  1: [1, 4, 9],    // Monday   — 09:30, 11:00, 13:30 taken
  2: [3, 6, 11],   // Tuesday  — 10:30, 12:00, 15:30 taken
  3: [0, 5, 8],    // Wednesday — 09:00, 11:30, 13:00 taken
  4: [2, 7, 10],   // Thursday  — 10:00, 12:30, 15:00 taken
  5: [1, 5, 9],    // Friday   — 09:30, 11:30, 13:30 taken
  6: [4, 6, 8],    // Saturday — 11:00, 12:00, 13:00 taken
};

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30",
];

const STEP_LABELS = ["Service", "Staff", "Date", "Time", "Details"];

// Pre-populated upcoming bookings shown after confirmation
const UPCOMING = [
  { name: "Marcus Holst", service: "Classic Cut",     date: "Tomorrow",    time: "10:30", barber: "Oliver Berg" },
  { name: "Emil Strand",  service: "Beard Sculpt",    date: "Thu 20 Mar",  time: "14:00", barber: "Marcus Lund" },
  { name: "Sofia Krag",   service: "Cut & Beard",     date: "Fri 21 Mar",  time: "11:00", barber: "Emil Dahl"   },
  { name: "Marcus Holst", service: "Hot Towel Shave", date: "Sat 22 Mar",  time: "13:30", barber: "Oliver Berg" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function getAvailDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 1; i <= 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d); // skip Sundays
    if (dates.length === 14) break;
  }
  return dates;
}

function CheckIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8L6.5 11.5L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "36px" }}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEP_LABELS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: done || active ? "var(--accent)" : "transparent",
                border: done || active ? "2px solid var(--accent)" : "2px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {done
                  ? <CheckIcon size={14} color="#0A0A0E" />
                  : <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "#0A0A0E" : "var(--text-muted)", lineHeight: 1 }}>{n}</span>
                }
              </div>
              <span style={{
                fontSize: "10px", fontWeight: active ? 700 : 500,
                color: active ? "var(--accent)" : done ? "var(--text-secondary)" : "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", marginTop: "14px", marginLeft: "6px", marginRight: "6px",
                background: current > n + 0 ? "var(--accent)" : "var(--border-strong)",
                transition: "background 0.25s",
              }} />
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
      {dates.map((d, i) => {
        const isSel = selected?.getTime() === d.getTime();
        return (
          <button key={i} onClick={() => onSelect(d)} style={{
            background: isSel ? "var(--accent-dim)" : "var(--surface-2)",
            border: `1px solid ${isSel ? "var(--accent)" : "var(--border-strong)"}`,
            borderRadius: "8px", padding: "12px 8px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            transition: "border-color 0.12s, background 0.12s",
          }}>
            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              {d.toLocaleDateString("en", { weekday: "short" })}
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: isSel ? "var(--accent)" : "var(--text)" }}>
              {d.getDate()}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              {d.toLocaleDateString("en", { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Confirmation Screen ───────────────────────────────────────────────────────

function ConfirmScreen({
  service, staffMember, date, time, clientName, clientEmail,
  onBookAgain,
}: {
  service: Service; staffMember: StaffMember; date: Date; time: string;
  clientName: string; clientEmail: string;
  onBookAgain: () => void;
}) {
  return (
    <div>
      {/* Success header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "var(--accent-dim)", border: "2px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <CheckIcon size={24} color="var(--accent)" />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "8px" }}>
          Booking confirmed
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Confirmation sent to <span style={{ color: "var(--text-secondary)" }}>{clientEmail}</span>
        </p>
      </div>

      {/* Booking summary */}
      <div style={{
        background: "var(--surface-2)", border: "1px solid var(--border-strong)",
        borderRadius: "8px", overflow: "hidden", marginBottom: "24px",
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            Your booking
          </span>
        </div>
        {[
          ["Service",  service.name],
          ["Price",    `€${service.price}`],
          ["Barber",   staffMember.name],
          ["Duration", `${service.duration} min`],
          ["Date",     fmtDate(date)],
          ["Time",     time],
        ].map(([label, value], i, arr) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 20px",
            borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div style={{
        background: "var(--surface-2)", border: "1px solid var(--border-strong)",
        borderRadius: "8px", overflow: "hidden", marginBottom: "24px",
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            Upcoming bookings at Nordklip
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Next 7 days</span>
        </div>

        {/* Just booked row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: "12px", padding: "12px 20px", alignItems: "center",
          borderBottom: "1px solid var(--border)",
          background: "rgba(0,212,168,0.05)",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{clientName}</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{service.name}</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{fmtDate(date)}, {time}</span>
          <span style={{
            fontSize: "11px", fontWeight: 700, color: "#FBBF24",
            textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
          }}>
            Just booked
          </span>
        </div>

        {UPCOMING.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px", padding: "12px 20px", alignItems: "center",
            borderBottom: i < UPCOMING.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: "13px", color: "var(--text)" }}>{row.name}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.service}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.date}, {row.time}</span>
            <span style={{
              fontSize: "11px", fontWeight: 700, color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              Confirmed
            </span>
          </div>
        ))}

        <div style={{ padding: "10px 20px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Demo — these are simulated bookings. In production your real customer appointments appear here.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onBookAgain}
          style={{
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--text)", borderRadius: "6px", padding: "11px 22px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          Book another
        </button>
        <a
          href="https://nordklip.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "var(--accent)", color: "#0A0A0E", borderRadius: "6px",
            padding: "11px 22px", fontSize: "14px", fontWeight: 700,
            display: "inline-block", textDecoration: "none",
          }}
        >
          Visit Nordklip
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; email: string } | null>(null);

  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const [service,     setService]     = useState<Service | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [date,        setDate]        = useState<Date | null>(null);
  const [time,        setTime]        = useState<string | null>(null);
  const [clientName,  setClientName]  = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes,       setNotes]       = useState("");
  const [errors,      setErrors]      = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("bf_session");
      if (!s) { router.replace("/"); return; }
      const parsed = JSON.parse(s);
      setSession(parsed);
      setClientName(parsed.name);
    } catch {
      router.replace("/");
    }
  }, [router]);

  function canProceed() {
    if (step === 1) return !!service;
    if (step === 2) return !!staffMember;
    if (step === 3) return !!date;
    if (step === 4) return !!time;
    return true;
  }

  function handleNext() {
    if (step < 5) { setStep(s => s + 1); return; }
    // Step 5 confirm
    const errs: { name?: string } = {};
    if (!clientName.trim()) errs.name = "Name is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setConfirmed(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFlow() {
    setStep(1); setConfirmed(false);
    setService(null); setStaffMember(null); setDate(null); setTime(null);
    setClientName(session?.name ?? ""); setClientPhone(""); setNotes("");
  }

  const dates = useMemo(() => getAvailDates(), []);
  const slots = useMemo(() => {
    if (!date) return [];
    // Use actual day-of-week so grayed slots are consistent and don't depend on array refs
    const dayOfWeek = date.getDay(); // 1=Mon, 2=Tue, … 6=Sat (0=Sun excluded from picker)
    const takenIndices = TAKEN_SLOTS_BY_DAY[dayOfWeek] ?? [];
    return TIME_SLOTS.map((t, i) => ({ time: t, taken: takenIndices.includes(i) }));
  }, [date]);

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Demo banner */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "44px",
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 200,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            background: "var(--accent)", color: "#0A0A0E",
            fontSize: "10px", fontWeight: 800, padding: "2px 8px",
            borderRadius: "4px", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>DEMO</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Nordklip Barbershop — powered by BookFlow
          </span>
        </div>
        <a
          href="https://sloth-studio.pages.dev"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}
        >
          Get this for your business
        </a>
      </div>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: "44px", height: "54px",
        background: "rgba(10,10,14,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 100,
      }}>
        <Link href="/" style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
          Book<span style={{ color: "var(--accent)" }}>Flow</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/how-it-works" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
            How it works
          </Link>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {session.name}
          </span>
          <button
            onClick={() => {
              try { sessionStorage.clear(); } catch {}
              router.push("/");
            }}
            style={{
              background: "transparent", border: "1px solid var(--border-strong)",
              color: "var(--text-secondary)", borderRadius: "6px",
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ paddingTop: "32px", paddingBottom: "80px", padding: "32px 16px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "640px" }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "10px", padding: "clamp(24px, 4vw, 40px)",
          }}>
            {confirmed ? (
              <ConfirmScreen
                service={service!} staffMember={staffMember!}
                date={date!} time={time!}
                clientName={clientName} clientEmail={session.email}
                onBookAgain={resetFlow}
              />
            ) : (
              <>
                <Steps current={step} />

                <div style={{ minHeight: "280px" }}>
                  {/* Step 1 — Service */}
                  {step === 1 && (
                    <>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Choose a service</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>What are you coming in for?</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                        {SERVICES.map(s => {
                          const sel = service?.id === s.id;
                          return (
                            <button key={s.id} onClick={() => setService(s)} style={{
                              background: sel ? "var(--accent-dim)" : "var(--surface-2)",
                              border: `1px solid ${sel ? "var(--accent)" : "var(--border-strong)"}`,
                              borderRadius: "8px", padding: "18px", cursor: "pointer", textAlign: "left",
                              transition: "border-color 0.12s, background 0.12s",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{s.name}</span>
                                <span style={{ fontSize: "15px", fontWeight: 700, color: sel ? "var(--accent)" : "var(--text)", flexShrink: 0, marginLeft: "8px" }}>€{s.price}</span>
                              </div>
                              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.4 }}>{s.desc}</p>
                              <span style={{
                                fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                                color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)",
                                borderRadius: "4px", padding: "2px 8px",
                              }}>{s.duration} min</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Step 2 — Staff */}
                  {step === 2 && (
                    <>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Choose your barber</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Pick someone or let us decide.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {STAFF.map(s => {
                          const sel = staffMember?.id === s.id;
                          return (
                            <button key={s.id} onClick={() => setStaffMember(s)} style={{
                              background: sel ? "var(--accent-dim)" : "var(--surface-2)",
                              border: `1px solid ${sel ? "var(--accent)" : "var(--border-strong)"}`,
                              borderRadius: "8px", padding: "18px", cursor: "pointer", textAlign: "left",
                              transition: "border-color 0.12s, background 0.12s",
                            }}>
                              <div style={{
                                width: "38px", height: "38px", borderRadius: "50%",
                                background: "var(--surface)", border: "1px solid var(--border-strong)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "12px", fontWeight: 700, color: "var(--text-muted)",
                                marginBottom: "12px",
                              }}>
                                {s.initials}
                              </div>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{s.name}</div>
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", marginBottom: "6px" }}>{s.role}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.note}</div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Step 3 — Date */}
                  {step === 3 && (
                    <>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Pick a date</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Available over the next two weeks. Sundays closed.</p>
                      <DatePicker selected={date} onSelect={d => { setDate(d); setTime(null); }} />
                    </>
                  )}

                  {/* Step 4 — Time */}
                  {step === 4 && (
                    <>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Choose a time</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                        Available slots for {date ? fmtDate(date) : ""}. Grayed slots are taken.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "8px" }}>
                        {slots.map(({ time: t, taken }) => {
                          const sel = time === t;
                          return (
                            <button key={t} onClick={() => !taken && setTime(t)} disabled={taken} style={{
                              background: sel ? "var(--accent-dim)" : "transparent",
                              border: `1px solid ${sel ? "var(--accent)" : taken ? "var(--border)" : "var(--border-strong)"}`,
                              borderRadius: "6px", padding: "11px 8px", cursor: taken ? "default" : "pointer",
                              color: sel ? "var(--accent)" : taken ? "var(--text-muted)" : "var(--text)",
                              fontSize: "14px", fontWeight: sel ? 700 : 400,
                              textDecoration: taken ? "line-through" : "none",
                              opacity: taken ? 0.4 : 1, textAlign: "center",
                              transition: "border-color 0.12s, background 0.12s",
                            }}>
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Step 5 — Details */}
                  {step === 5 && (
                    <>
                      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Your details</h2>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>Almost done. Just your contact info.</p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            Full name <span style={{ color: "var(--red)" }}>*</span>
                          </label>
                          <input
                            type="text" placeholder="Marcus Holst" value={clientName}
                            onChange={e => { setClientName(e.target.value); setErrors({}); }}
                            style={errors.name ? { borderColor: "var(--red)" } : {}}
                          />
                          {errors.name && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px" }}>{errors.name}</p>}
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            Phone{" "}<span style={{ fontWeight: 400, textTransform: "none" }}>optional</span>
                          </label>
                          <input type="tel" placeholder="+45 12 34 56 78" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            Notes{" "}<span style={{ fontWeight: 400, textTransform: "none" }}>optional</span>
                          </label>
                          <textarea placeholder="Anything we should know..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "vertical" }} />
                        </div>
                      </div>

                      {/* Summary */}
                      <div style={{
                        background: "var(--surface-2)", border: "1px solid var(--border-strong)",
                        borderRadius: "8px", overflow: "hidden",
                      }}>
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Summary</span>
                        </div>
                        {[
                          ["Service", service?.name ?? ""],
                          ["Barber",  staffMember?.name ?? ""],
                          ["Date",    date ? fmtDate(date) : ""],
                          ["Time",    time ?? ""],
                          ["Price",   `€${service?.price ?? ""}`],
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                            <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Nav buttons */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)",
                }}>
                  <button
                    onClick={() => setStep(s => s - 1)} disabled={step === 1}
                    style={{
                      background: "transparent", border: "1px solid var(--border-strong)",
                      color: "var(--text)", borderRadius: "6px", padding: "11px 22px",
                      fontSize: "14px", fontWeight: 600,
                      cursor: step === 1 ? "default" : "pointer",
                      opacity: step === 1 ? 0.35 : 1,
                    }}
                  >
                    Back
                  </button>

                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Step {step} of 5
                  </span>

                  <button
                    onClick={handleNext} disabled={!canProceed()}
                    style={{
                      background: canProceed() ? "var(--accent)" : "var(--surface-2)",
                      border: "none", color: canProceed() ? "#0A0A0E" : "var(--text-muted)",
                      borderRadius: "6px", padding: "11px 26px",
                      fontSize: "14px", fontWeight: 700,
                      cursor: canProceed() ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                  >
                    {step === 5 ? "Confirm booking" : "Continue"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Floating badge */}
      <a
        href="https://sloth-studio.pages.dev"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          background: "var(--surface-2)", border: "1px solid var(--border-strong)",
          color: "var(--text-secondary)", padding: "8px 16px",
          borderRadius: "100px", fontSize: "12px", fontWeight: 600,
          textDecoration: "none", letterSpacing: "0.02em",
        }}
      >
        Built by Sloth Studio
      </a>
    </div>
  );
}
