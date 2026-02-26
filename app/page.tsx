"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;    // DKK
}

interface Staff {
  id: string;
  name: string;
  role: string;
  specialty: string;
  initials: string;
}

interface BookingState {
  service: Service | null;
  staff: Staff | null;
  date: Date | null;
  time: string | null;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: "classic-cut",       name: "Classic Cut",       duration: 45, price: 250 },
  { id: "beard-sculpt",      name: "Beard Sculpt",      duration: 30, price: 180 },
  { id: "cut-and-beard",     name: "Cut & Beard",       duration: 70, price: 380 },
  { id: "hot-towel-shave",   name: "Hot Towel Shave",   duration: 40, price: 220 },
];

const STAFF: Staff[] = [
  { id: "marcus",      name: "Marcus Holst", role: "Senior Barber",      specialty: "Taper fades & vintage cuts",  initials: "MH" },
  { id: "emil",        name: "Emil Strand",  role: "Barber",              specialty: "Modern textured styles",       initials: "ES" },
  { id: "sofia",       name: "Sofia Krag",   role: "Barber & Colorist",   specialty: "Color & precision cuts",       initials: "SK" },
  { id: "no-pref",     name: "No Preference", role: "Any Available",     specialty: "We'll assign the best available", initials: "?" },
];

const STEP_LABELS = ["Service", "Staff", "Date", "Time", "Details"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generateTimeSlots(service: Service): { time: string; taken: boolean }[] {
  const longService = service.duration >= 60;
  const start = 10 * 60; // 10:00 in minutes
  const end = longService ? 17 * 60 : 18 * 60;
  const interval = longService ? 60 : 30;
  const slots: { time: string; taken: boolean }[] = [];
  let idx = 0;
  for (let m = start; m < end; m += interval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const label = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    slots.push({ time: label, taken: idx % 3 === 2 });
    idx++;
  }
  return slots;
}

// ─── Calendar Component ───────────────────────────────────────────────────────

function Calendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);
  // Week starts Monday: shift Sunday (0) to 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays   = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d));

  const monthName = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  function isPast(d: Date) { return d < today; }
  function isSunday(d: Date) { return d.getDay() === 0; }
  function isDisabled(d: Date) { return isPast(d) || isSunday(d); }
  function isToday(d: Date) {
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth() &&
           d.getDate()     === today.getDate();
  }
  function isSelected(d: Date) {
    return selected !== null &&
           d.getFullYear() === selected.getFullYear() &&
           d.getMonth()    === selected.getMonth() &&
           d.getDate()     === selected.getDate();
  }

  const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={prevMonth}
          style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
        >
          &#8249;
        </button>
        <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text)" }}>{monthName}</span>
        <button
          onClick={nextMonth}
          style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
        >
          &#8250;
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const disabled = isDisabled(date);
          const selected_ = isSelected(date);
          const today_    = isToday(date);

          let bg = "transparent";
          let border = "1px solid transparent";
          let color = "var(--text)";
          let cursor = "pointer";
          let opacity = "1";

          if (disabled) {
            color = "var(--text-muted)";
            cursor = "default";
            opacity = "0.4";
          }
          if (today_ && !selected_) {
            border = "1px solid var(--accent-border)";
          }
          if (selected_) {
            bg = "var(--accent)";
            color = "#0A0A0E";
            border = "1px solid var(--accent)";
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              style={{
                background: bg,
                border,
                color,
                cursor,
                opacity,
                borderRadius: "8px",
                padding: "8px 4px",
                fontSize: "13px",
                fontWeight: selected_ ? 700 : today_ ? 600 : 400,
                textAlign: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!disabled && !selected_) (e.currentTarget.style.background = "var(--surface)"); }}
              onMouseLeave={e => { if (!disabled && !selected_) (e.currentTarget.style.background = "transparent"); }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", gap: "0" }}>
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = step > stepNum;
        const isCurrent   = step === stepNum;
        const isFuture    = step < stepNum;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? "1" : "0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "48px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: isCompleted || isCurrent ? "var(--accent)" : "var(--surface-2)",
                border: isFuture ? "2px solid var(--border-strong)" : "2px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isCompleted || isCurrent ? "#0A0A0E" : "var(--text-muted)",
                fontSize: "11px", fontWeight: 700,
                transition: "all 0.2s",
              }}>
                {isCompleted ? <Check size={13} strokeWidth={3} /> : stepNum}
              </div>
              <span style={{
                fontSize: "10px",
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? "var(--accent)" : isCompleted ? "var(--text-secondary)" : "var(--text-muted)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1,
                height: "2px",
                background: step > stepNum ? "var(--accent)" : "var(--border-strong)",
                margin: "0 4px",
                marginBottom: "20px",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState<number | "confirmed">(1);
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    staff: null,
    date: null,
    time: null,
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function resetBooking() {
    setStep(1);
    setBooking({ service: null, staff: null, date: null, time: null, name: "", email: "", phone: "", notes: "" });
    setErrors({});
  }

  function goNext() {
    if (step === 5) {
      // Validate
      const newErrors: { name?: string; email?: string } = {};
      if (!booking.name.trim()) newErrors.name = "Full name is required.";
      if (!booking.email.trim()) newErrors.email = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) newErrors.email = "Enter a valid email address.";
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setErrors({});
      setStep("confirmed");
      return;
    }
    if (typeof step === "number") setStep(step + 1);
  }

  function goBack() {
    if (typeof step === "number" && step > 1) setStep(step - 1);
  }

  function canGoNext(): boolean {
    if (step === 1) return booking.service !== null;
    if (step === 2) return booking.staff !== null;
    if (step === 3) return booking.date !== null;
    if (step === 4) return booking.time !== null;
    if (step === 5) return true;
    return false;
  }

  const timeSlots = useMemo(() => {
    if (!booking.service) return [];
    return generateTimeSlots(booking.service);
  }, [booking.service]);

  // ─── Confirmation ─────────────────────────────────────────────────────────

  if (step === "confirmed") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* Demo Banner */}
        <DemoBanner />
        {/* Nav */}
        <Nav />

        <main style={{ paddingTop: "44px", minHeight: "calc(100vh - 44px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 16px 80px" }}>
          <div style={{ width: "100%", maxWidth: "560px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "48px 32px", textAlign: "center" }}>
            {/* Checkmark */}
            <div style={{ margin: "0 auto 24px", width: "72px", height: "72px", borderRadius: "50%", background: "var(--accent-dim)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L13 23L26 9" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>You&apos;re booked.</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "15px" }}>
              See you at Nordklip. Here&apos;s your booking summary.
            </p>

            {/* Summary card */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "12px", padding: "24px", textAlign: "left", marginBottom: "24px" }}>
              {[
                { label: "Service", value: booking.service?.name ?? "" },
                { label: "Barber",  value: booking.staff?.name ?? "" },
                { label: "Date",    value: booking.date ? formatDate(booking.date) : "" },
                { label: "Time",    value: booking.time ?? "" },
                { label: "Name",    value: booking.name },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                  <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              A confirmation has been sent to {booking.email}.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "32px" }}>
              Demo mode — in production this sends a real confirmation email.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={resetBooking}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Book Another
              </button>
              <a
                href="https://nordklip.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "var(--accent)", border: "none", color: "#0A0A0E", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-block" }}
              >
                Visit Nordklip
              </a>
            </div>
          </div>
        </main>

        <FloatingBadge />
      </div>
    );
  }

  // ─── Booking Flow ─────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DemoBanner />
      <Nav />

      <main style={{ paddingTop: "100px", paddingBottom: "80px", padding: "120px 16px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>
          {/* Card */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "clamp(24px, 4vw, 40px)" }}>
            <ProgressBar step={step as number} />

            {/* Step content */}
            <div style={{ minHeight: "320px" }}>
              {step === 1 && (
                <Step1
                  selected={booking.service}
                  onSelect={s => setBooking(b => ({ ...b, service: s, time: null }))}
                />
              )}
              {step === 2 && (
                <Step2
                  selected={booking.staff}
                  onSelect={s => setBooking(b => ({ ...b, staff: s }))}
                />
              )}
              {step === 3 && (
                <Step3
                  selected={booking.date}
                  onSelect={d => setBooking(b => ({ ...b, date: d, time: null }))}
                />
              )}
              {step === 4 && (
                <Step4
                  slots={timeSlots}
                  selected={booking.time}
                  onSelect={t => setBooking(b => ({ ...b, time: t }))}
                />
              )}
              {step === 5 && (
                <Step5
                  name={booking.name}
                  email={booking.email}
                  phone={booking.phone}
                  notes={booking.notes}
                  errors={errors}
                  onChange={(field, val) => {
                    setBooking(b => ({ ...b, [field]: val }));
                    if (errors[field as keyof typeof errors]) {
                      setErrors(e => ({ ...e, [field]: undefined }));
                    }
                  }}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={goBack}
                disabled={step === 1}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  color: step === 1 ? "var(--text-muted)" : "var(--text)",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: step === 1 ? "default" : "pointer",
                  opacity: step === 1 ? 0.4 : 1,
                  transition: "all 0.15s",
                }}
              >
                Back
              </button>

              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Step {step} of 5
              </div>

              <button
                onClick={goNext}
                disabled={!canGoNext()}
                style={{
                  background: canGoNext() ? "var(--accent)" : "var(--surface-2)",
                  border: "none",
                  color: canGoNext() ? "#0A0A0E" : "var(--text-muted)",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: canGoNext() ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                {step === 5 ? "Confirm Booking" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <FloatingBadge />
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1({ selected, onSelect }: { selected: Service | null; onSelect: (s: Service) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
        What are you coming in for?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Select a service to get started.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
        {SERVICES.map(service => {
          const isSelected = selected?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface-2)",
                border: isSelected ? "2px solid var(--accent)" : "2px solid var(--border-strong)",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text)", marginBottom: "10px" }}>
                {service.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>
                  {service.duration} min
                </span>
                <span style={{ fontWeight: 700, fontSize: "15px", color: isSelected ? "var(--accent)" : "var(--text)" }}>
                  {service.price} DKK
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({ selected, onSelect }: { selected: Staff | null; onSelect: (s: Staff) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
        Who would you like?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Choose your preferred barber, or let us decide.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
        {STAFF.map(member => {
          const isSelected = selected?.id === member.id;
          const isNoPref = member.id === "no-pref";
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface-2)",
                border: isSelected ? "2px solid var(--accent)" : "2px solid var(--border-strong)",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: isNoPref ? "var(--surface)" : "var(--surface)",
                border: isNoPref ? "2px solid var(--border-strong)" : "2px solid var(--yellow)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "12px",
                fontSize: "13px", fontWeight: 700,
                color: isNoPref ? "var(--text-muted)" : "var(--yellow)",
              }}>
                {member.initials}
              </div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "2px" }}>
                {member.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginBottom: "6px" }}>
                {member.role}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                {member.specialty}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
        When would you like to come in?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Select a date. Sundays are closed.
      </p>
      <Calendar selected={selected} onSelect={onSelect} />
      {selected && (
        <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--accent)", fontWeight: 600, textAlign: "center" }}>
          Selected: {formatDate(selected)}
        </p>
      )}
    </div>
  );
}

function Step4({
  slots,
  selected,
  onSelect,
}: {
  slots: { time: string; taken: boolean }[];
  selected: string | null;
  onSelect: (t: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
        Choose a time slot.
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Available slots are shown below. Taken slots are unavailable.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "8px" }}>
        {slots.map(({ time, taken }) => {
          const isSelected = selected === time;
          return (
            <button
              key={time}
              onClick={() => !taken && onSelect(time)}
              disabled={taken}
              style={{
                background: isSelected ? "var(--accent-dim)" : taken ? "transparent" : "var(--surface-2)",
                border: isSelected ? "2px solid var(--accent)" : `2px solid ${taken ? "var(--border)" : "var(--border-strong)"}`,
                borderRadius: "8px",
                padding: "12px 8px",
                cursor: taken ? "default" : "pointer",
                color: taken ? "var(--text-muted)" : isSelected ? "var(--accent)" : "var(--text)",
                fontSize: "14px",
                fontWeight: isSelected ? 700 : 500,
                textDecoration: taken ? "line-through" : "none",
                opacity: taken ? 0.45 : 1,
                transition: "all 0.15s",
              }}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step5({
  name, email, phone, notes, errors, onChange,
}: {
  name: string; email: string; phone: string; notes: string;
  errors: { name?: string; email?: string };
  onChange: (field: string, val: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
        Almost done. Just your details.
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Fill in your contact information to complete the booking.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Full Name <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => onChange("name", e.target.value)}
            style={{ borderColor: errors.name ? "var(--red)" : undefined }}
          />
          {errors.name && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{errors.name}</p>}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Email Address <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => onChange("email", e.target.value)}
            style={{ borderColor: errors.email ? "var(--red)" : undefined }}
          />
          {errors.email && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{errors.email}</p>}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Phone Number <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+45 ..."
            value={phone}
            onChange={e => onChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Notes <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            placeholder="Anything we should know before your visit?"
            value={notes}
            onChange={e => onChange("notes", e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Layout Components ────────────────────────────────────────────────────────

function DemoBanner() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: "44px",
      background: "var(--bg)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      zIndex: 1000,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          background: "var(--accent)",
          color: "#0A0A0E",
          fontSize: "10px",
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: "100px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          DEMO
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          This is a demo for Nordklip
        </span>
      </div>
      <a
        href="https://sloth-studio.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--accent)",
          textDecoration: "none",
          letterSpacing: "0.01em",
        }}
      >
        Get a booking system like this
      </a>
    </div>
  );
}

function Nav() {
  return (
    <nav style={{
      position: "sticky",
      top: "44px",
      height: "56px",
      background: "rgba(10,10,14,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      zIndex: 900,
    }}>
      <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>
        Nordklip
      </span>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--text-muted)",
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: "100px",
        padding: "4px 12px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        Powered by BookFlow
      </span>
    </nav>
  );
}

function FloatingBadge() {
  return (
    <a
      href="https://sloth-studio.pages.dev"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        color: "var(--text-secondary)",
        padding: "8px 16px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: 600,
        textDecoration: "none",
        letterSpacing: "0.02em",
      }}
    >
      Built by Sloth Studio
    </a>
  );
}
