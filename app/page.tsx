"use client";

import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
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

// ─── Static Data ─────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: "classic-cut",     name: "Classic Cut",     duration: 45, price: 250 },
  { id: "beard-sculpt",    name: "Beard Sculpt",    duration: 30, price: 180 },
  { id: "cut-and-beard",   name: "Cut & Beard",     duration: 70, price: 380 },
  { id: "hot-towel-shave", name: "Hot Towel Shave", duration: 40, price: 220 },
];

const STAFF: Staff[] = [
  { id: "marcus",  name: "Marcus Holst",  role: "Senior Barber",    specialty: "Taper fades & vintage cuts",      initials: "MH" },
  { id: "emil",    name: "Emil Strand",   role: "Barber",            specialty: "Modern textured styles",          initials: "ES" },
  { id: "sofia",   name: "Sofia Krag",    role: "Barber & Colorist", specialty: "Color & precision cuts",          initials: "SK" },
  { id: "no-pref", name: "No Preference", role: "Any Available",     specialty: "We'll assign the best available", initials: "--" },
];

const STEP_LABELS = ["Service", "Staff", "Date", "Time", "Details"];

// Simulated upcoming bookings shown on the confirmation screen
const UPCOMING_BOOKINGS = [
  { barber: "Marcus Holst", service: "Classic Cut",     when: "Tomorrow, 10:30",      status: "Confirmed" },
  { barber: "Emil Strand",  service: "Beard Sculpt",    when: "Thu 20 Mar, 14:00",    status: "Confirmed" },
  { barber: "Sofia Krag",   service: "Cut & Beard",     when: "Fri 21 Mar, 11:00",    status: "Confirmed" },
  { barber: "Marcus Holst", service: "Hot Towel Shave", when: "Sat 22 Mar, 13:30",    status: "Confirmed" },
];

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
  const start = 10 * 60;
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

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IconCheck({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6L5 9L10 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheckLarge({ size = 32, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M6 16L13 23L26 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────

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
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
  const totalDays   = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d));

  const monthName = firstDay.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function isPast(d: Date)    { return d < today; }
  function isSunday(d: Date)  { return d.getDay() === 0; }
  function isDisabled(d: Date){ return isPast(d) || isSunday(d); }
  function isToday(d: Date)   {
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth()    &&
           d.getDate()     === today.getDate();
  }
  function isSelected(d: Date) {
    return selected !== null &&
           d.getFullYear() === selected.getFullYear() &&
           d.getMonth()    === selected.getMonth()    &&
           d.getDate()     === selected.getDate();
  }

  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border-strong)",
      borderRadius: "8px",
      padding: "20px",
    }}>
      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={prevMonth}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-secondary)",
            borderRadius: "6px",
            width: "32px", height: "32px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", lineHeight: 1,
          }}
        >
          &#8249;
        </button>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)", letterSpacing: "0.01em" }}>
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-secondary)",
            borderRadius: "6px",
            width: "32px", height: "32px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", lineHeight: 1,
          }}
        >
          &#8250;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "6px" }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{
            textAlign: "center",
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--text-muted)",
            padding: "4px 0",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;

          const disabled  = isDisabled(date);
          const selected_ = isSelected(date);
          const today_    = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              style={{
                background: selected_ ? "var(--accent)" : "transparent",
                border: selected_
                  ? "1px solid var(--accent)"
                  : today_
                  ? "1px solid var(--accent-border)"
                  : "1px solid transparent",
                borderRadius: "6px",
                padding: "7px 4px",
                fontSize: "13px",
                fontWeight: selected_ ? 700 : today_ ? 600 : 400,
                color: selected_ ? "#0A0A0E" : disabled ? "var(--text-muted)" : "var(--text)",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.38 : 1,
                textAlign: "center",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={e => {
                if (!disabled && !selected_) e.currentTarget.style.background = "var(--surface)";
              }}
              onMouseLeave={e => {
                if (!disabled && !selected_) e.currentTarget.style.background = "transparent";
              }}
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
// Completed step: filled circle + SVG checkmark
// Current step:   filled circle + number
// Future step:    empty circle + number (muted)

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      marginBottom: "36px",
    }}>
      {STEP_LABELS.map((label, i) => {
        const stepNum    = i + 1;
        const isComplete = step > stepNum;
        const isCurrent  = step === stepNum;

        return (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEP_LABELS.length - 1 ? 1 : 0 }}>
            {/* Circle + label */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                flexShrink: 0,
                background: isComplete || isCurrent ? "var(--accent)" : "transparent",
                border: isComplete || isCurrent
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {isComplete ? (
                  <IconCheck size={12} color="#0A0A0E" />
                ) : (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isCurrent ? "#0A0A0E" : "var(--text-muted)",
                    lineHeight: 1,
                  }}>
                    {stepNum}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "10px",
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent
                  ? "var(--accent)"
                  : isComplete
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>

            {/* Connecting line (between circles, not below labels) */}
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1,
                height: "2px",
                marginTop: "13px",   /* aligns with circle center */
                marginLeft: "6px",
                marginRight: "6px",
                background: step > stepNum ? "var(--accent)" : "var(--border-strong)",
                transition: "background 0.25s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Upcoming Bookings (shown on confirmation) ────────────────────────────────

function UpcomingBookings() {
  return (
    <div style={{ width: "100%", maxWidth: "600px", marginTop: "24px" }}>
      {/* Section header */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-strong)",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Upcoming Bookings at Nordklip
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Next 7 days
          </span>
        </div>

        {/* Table rows */}
        {UPCOMING_BOOKINGS.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "12px",
              padding: "14px 24px",
              alignItems: "center",
              borderBottom: i < UPCOMING_BOOKINGS.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>{row.barber}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.service}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.when}</span>
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              {row.status}
            </span>
          </div>
        ))}

        {/* Demo note */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid var(--border-strong)",
          background: "var(--surface-2)",
        }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Demo mode — these are simulated bookings. In production, your real customer bookings appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — Service Selection ───────────────────────────────────────────────

function Step1({
  selected,
  onSelect,
}: {
  selected: Service | null;
  onSelect: (s: Service) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        What are you coming in for?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Select a service to get started.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        gap: "10px",
      }}>
        {SERVICES.map(service => {
          const active = selected?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              style={{
                background: active ? "var(--accent-dim)" : "var(--surface-2)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                borderRadius: "8px",
                padding: "18px 20px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.12s, background 0.12s",
              }}
            >
              <div style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}>
                {service.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {service.duration} min
                </span>
                <span style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: active ? "var(--accent)" : "var(--text)",
                }}>
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

// ─── Step 2 — Staff Selection ─────────────────────────────────────────────────

function Step2({
  selected,
  onSelect,
}: {
  selected: Staff | null;
  onSelect: (s: Staff) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        Who would you like?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Choose your preferred barber, or let us decide.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        gap: "10px",
      }}>
        {STAFF.map(member => {
          const active   = selected?.id === member.id;
          const isNoPref = member.id === "no-pref";
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              style={{
                background: active ? "var(--accent-dim)" : "var(--surface-2)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                borderRadius: "8px",
                padding: "18px 20px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.12s, background 0.12s",
              }}
            >
              {/* Initials circle */}
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--surface)",
                border: `1px solid ${active ? "var(--accent-border)" : "var(--border-strong)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
                fontSize: "12px",
                fontWeight: 700,
                color: isNoPref ? "var(--text-muted)" : "var(--text-secondary)",
                letterSpacing: "0.04em",
              }}>
                {member.initials}
              </div>

              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>
                {member.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginBottom: "6px" }}>
                {member.role}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                {member.specialty}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3 — Date Selection ──────────────────────────────────────────────────

function Step3({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        When would you like to come in?
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Pick a date. Sundays are closed.
      </p>
      <Calendar selected={selected} onSelect={onSelect} />
      {selected && (
        <p style={{
          marginTop: "12px",
          fontSize: "13px",
          color: "var(--accent)",
          fontWeight: 600,
          textAlign: "center",
        }}>
          {formatDate(selected)}
        </p>
      )}
    </div>
  );
}

// ─── Step 4 — Time Slot Selection ─────────────────────────────────────────────

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
      <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        Choose a time slot.
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Grayed-out slots are already taken.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))",
        gap: "8px",
      }}>
        {slots.map(({ time, taken }) => {
          const active = selected === time;
          return (
            <button
              key={time}
              onClick={() => !taken && onSelect(time)}
              disabled={taken}
              style={{
                background: active ? "var(--accent-dim)" : "transparent",
                border: active
                  ? "1px solid var(--accent)"
                  : taken
                  ? "1px solid var(--border)"
                  : "1px solid var(--border-strong)",
                borderRadius: "6px",
                padding: "11px 8px",
                cursor: taken ? "default" : "pointer",
                color: taken ? "var(--text-muted)" : active ? "var(--accent)" : "var(--text)",
                fontSize: "14px",
                fontWeight: active ? 700 : 400,
                textDecoration: taken ? "line-through" : "none",
                opacity: taken ? 0.4 : 1,
                textAlign: "center",
                transition: "border-color 0.12s, background 0.12s",
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

// ─── Step 5 — Contact Details ─────────────────────────────────────────────────

function Step5({
  name, email, phone, notes, errors, onChange,
}: {
  name: string;
  email: string;
  phone: string;
  notes: string;
  errors: { name?: string; email?: string };
  onChange: (field: string, val: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        Almost done. Just your details.
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Your contact information to complete the booking.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Full Name <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => onChange("name", e.target.value)}
            style={errors.name ? { borderColor: "var(--red)" } : {}}
          />
          {errors.name && (
            <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px" }}>{errors.name}</p>
          )}
        </div>

        <div>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Email Address <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => onChange("email", e.target.value)}
            style={errors.email ? { borderColor: "var(--red)" } : {}}
          />
          {errors.email && (
            <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px" }}>{errors.email}</p>
          )}
        </div>

        <div>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Phone{" "}
            <span style={{ fontWeight: 400, textTransform: "none", fontSize: "11px", color: "var(--text-muted)" }}>
              optional
            </span>
          </label>
          <input
            type="tel"
            placeholder="+45 ..."
            value={phone}
            onChange={e => onChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Notes{" "}
            <span style={{ fontWeight: 400, textTransform: "none", fontSize: "11px", color: "var(--text-muted)" }}>
              optional
            </span>
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

// ─── Shared Layout Pieces ─────────────────────────────────────────────────────

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
      padding: "0 20px",
      zIndex: 1000,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          background: "var(--accent)",
          color: "#0A0A0E",
          fontSize: "10px",
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: "4px",
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
      background: "rgba(10,10,14,0.96)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 900,
    }}>
      <span style={{
        fontSize: "17px",
        fontWeight: 800,
        color: "var(--accent)",
        letterSpacing: "-0.02em",
      }}>
        Nordklip
      </span>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--text-muted)",
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: "4px",
        padding: "4px 10px",
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

// ─── Root Page ────────────────────────────────────────────────────────────────

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
      const errs: { name?: string; email?: string } = {};
      if (!booking.name.trim())  errs.name = "Full name is required.";
      if (!booking.email.trim()) errs.email = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email))
        errs.email = "Enter a valid email address.";
      if (Object.keys(errs).length) { setErrors(errs); return; }
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
    if (step === 2) return booking.staff   !== null;
    if (step === 3) return booking.date    !== null;
    if (step === 4) return booking.time    !== null;
    if (step === 5) return true;
    return false;
  }

  const timeSlots = useMemo(() => {
    if (!booking.service) return [];
    return generateTimeSlots(booking.service);
  }, [booking.service]);

  // ─── Confirmation Screen ───────────────────────────────────────────────────

  if (step === "confirmed") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <DemoBanner />
        <Nav />

        <main style={{
          paddingTop: "100px",
          paddingBottom: "80px",
          padding: "120px 16px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          {/* Confirmation card */}
          <div style={{
            width: "100%",
            maxWidth: "600px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "40px 32px",
            textAlign: "center",
          }}>
            {/* Check circle */}
            <div style={{
              margin: "0 auto 20px",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--accent-dim)",
              border: "2px solid var(--accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IconCheckLarge size={28} color="var(--accent)" />
            </div>

            <h1 style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}>
              You&apos;re booked.
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "32px" }}>
              See you at Nordklip. Here&apos;s your booking summary.
            </p>

            {/* Summary rows */}
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: "8px",
              textAlign: "left",
              marginBottom: "20px",
              overflow: "hidden",
            }}>
              {[
                { label: "Service", value: booking.service?.name ?? "" },
                { label: "Barber",  value: booking.staff?.name  ?? "" },
                { label: "Date",    value: booking.date ? formatDate(booking.date) : "" },
                { label: "Time",    value: booking.time ?? "" },
                { label: "Name",    value: booking.name },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              A confirmation has been sent to {booking.email}.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "28px" }}>
              Demo mode — in production this sends a real confirmation email.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={resetBooking}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text)",
                  borderRadius: "6px",
                  padding: "11px 22px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Book Another
              </button>
              <a
                href="https://nordklip.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "var(--accent)",
                  border: "none",
                  color: "#0A0A0E",
                  borderRadius: "6px",
                  padding: "11px 22px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Visit Nordklip
              </a>
            </div>
          </div>

          {/* Upcoming bookings table */}
          <UpcomingBookings />
        </main>

        <FloatingBadge />
      </div>
    );
  }

  // ─── Booking Flow ──────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DemoBanner />
      <Nav />

      <main style={{
        padding: "120px 16px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "clamp(24px, 4vw, 40px)",
          }}>
            <ProgressBar step={step as number} />

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

            {/* Back / Next */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border)",
            }}>
              <button
                onClick={goBack}
                disabled={step === 1}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text)",
                  borderRadius: "6px",
                  padding: "11px 22px",
                  fontSize: "14px",
                  fontWeight: 600,
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
                onClick={goNext}
                disabled={!canGoNext()}
                style={{
                  background: canGoNext() ? "var(--accent)" : "var(--surface-2)",
                  border: "none",
                  color: canGoNext() ? "#0A0A0E" : "var(--text-muted)",
                  borderRadius: "6px",
                  padding: "11px 22px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: canGoNext() ? "pointer" : "default",
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
