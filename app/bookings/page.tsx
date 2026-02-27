"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  service: string; staff: string; date: string; time: string;
  name: string; price: number; createdAt: number;
}

const DEMO_BOOKINGS: Booking[] = [
  { service: "Classic Cut",     staff: "Oliver Berg", date: "Tomorrow",   time: "10:30", name: "Marcus Holst", price: 35, createdAt: 0 },
  { service: "Beard Sculpt",    staff: "Marcus Lund", date: "Thu 20 Mar", time: "14:00", name: "Emil Strand",  price: 20, createdAt: 0 },
  { service: "Cut & Beard",     staff: "Emil Dahl",   date: "Fri 21 Mar", time: "11:00", name: "Sofia Krag",   price: 50, createdAt: 0 },
  { service: "Hot Towel Shave", staff: "Oliver Berg", date: "Sat 22 Mar", time: "13:30", name: "Marcus Holst", price: 28, createdAt: 0 },
];

const STAFF_PHOTOS: Record<string, string> = {
  "Oliver Berg": "https://i.pravatar.cc/120?img=68",
  "Marcus Lund": "https://i.pravatar.cc/120?img=57",
  "Emil Dahl":   "https://i.pravatar.cc/120?img=13",
};

const SERVICE_ACCENTS: Record<string, string> = {
  "Classic Cut":     "#B8985A",
  "Beard Sculpt":    "#7BA3C4",
  "Cut & Beard":     "#C4977A",
  "Hot Towel Shave": "#7BBFA5",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCalendar = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconScissors = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const IconCoins = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
    <path d="M7 6h1v4"/><line x1="16.71" y1="13.88" x2="17" y2="14"/>
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, sub, accent, icon }: {
  value: string; label: string; sub: string; accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderTop: `2px solid ${accent}`,
      borderRadius: "10px",
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle glow behind icon */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
        background: `radial-gradient(circle at 100% 0%, ${accent}14 0%, transparent 70%)`,
        pointerEvents: "none",
      }}/>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "7px",
          background: `${accent}14`, border: `1px solid ${accent}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <div className="serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginBottom: "8px" }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, isNew = false }: { booking: Booking; isNew?: boolean }) {
  const photo = STAFF_PHOTOS[booking.staff];
  const initials = booking.staff.split(" ").map(n => n[0]).join("");
  const accent = SERVICE_ACCENTS[booking.service] || "#B8985A";
  const isSpecialDate = booking.date === "Tomorrow" || booking.date === "Today";

  // Parse date parts for non-special dates
  const parts = booking.date.split(" ");
  const dayLabel = !isSpecialDate && parts.length >= 1 ? parts[0] : "";
  const dayNum   = !isSpecialDate && parts.length >= 2 ? parts[1] : "";
  const monthStr = !isSpecialDate && parts.length >= 3 ? parts[2] : "";

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: "10px",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Service colour accent bar — fades out */}
      <div style={{
        height: "2px",
        background: `linear-gradient(90deg, ${accent} 0%, ${accent}40 50%, transparent 100%)`,
      }}/>

      <div style={{ display: "flex", alignItems: "stretch" }}>

        {/* Date / time column */}
        <div style={{
          width: "80px", flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "16px 10px", gap: "2px",
          background: isNew ? `${accent}08` : "transparent",
        }}>
          {isSpecialDate ? (
            <>
              <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "4px" }}>
                {booking.date}
              </span>
              <span className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                {booking.time}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                {dayLabel}
              </span>
              <span className="serif" style={{ fontSize: "26px", fontWeight: 700, color: isNew ? accent : "var(--text)", lineHeight: 1, marginTop: "1px" }}>
                {dayNum}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{monthStr}</span>
              <div style={{ width: "24px", height: "1px", background: "var(--border)", margin: "6px 0" }}/>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>{booking.time}</span>
            </>
          )}
        </div>

        {/* Service + barber */}
        <div style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {photo ? (
              <img src={photo} alt={booking.staff} style={{
                width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover",
                border: `2px solid ${isNew ? accent : "var(--border-strong)"}`,
                display: "block",
              }}/>
            ) : (
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: "var(--surface-2)", border: `2px solid ${isNew ? accent : "var(--border-strong)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>{initials}</span>
              </div>
            )}
            {/* Online indicator */}
            <div style={{
              position: "absolute", bottom: "1px", right: "1px",
              width: "10px", height: "10px", borderRadius: "50%",
              background: "#4ade80", border: "2px solid var(--surface)",
            }}/>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "15px", fontWeight: 700, color: "var(--text)",
              fontFamily: "var(--font-playfair)", marginBottom: "3px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{booking.service}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>{booking.staff}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="var(--text-muted)" strokeWidth="1.2"/><path d="M1 11c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", opacity: 0.65 }}>{booking.name}</span>
            </div>
          </div>
        </div>

        {/* Price + status */}
        <div style={{
          padding: "14px 18px", flexShrink: 0, minWidth: "90px",
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "8px",
        }}>
          <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>€{booking.price}</span>
          {isNew ? (
            <span style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
              color: accent, background: `${accent}18`, border: `1px solid ${accent}45`,
              borderRadius: "4px", padding: "3px 8px", whiteSpace: "nowrap",
            }}>New</span>
          ) : (
            <span style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              color: "var(--gold)", background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
              borderRadius: "4px", padding: "3px 8px", whiteSpace: "nowrap",
            }}>Confirmed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children, count, aside }: { children: React.ReactNode; count?: number; aside?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "14px", gap: "10px" }}>
      <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "var(--gold)", flexShrink: 0 }}/>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", letterSpacing: "0.01em" }}>{children}</span>
      {count !== undefined && (
        <span style={{
          fontSize: "10px", fontWeight: 700, color: "var(--gold)",
          background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
          borderRadius: "9999px", padding: "1px 7px",
        }}>{count}</span>
      )}
      {aside && <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>{aside}</span>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      padding: "40px 24px", textAlign: "center",
      background: "var(--surface)", border: "1px solid var(--border-strong)",
      borderRadius: "10px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.4,
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(184,152,90,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }}/>
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: "var(--surface-2)", border: "1px solid var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <IconCalendar color="var(--text-muted)"/>
      </div>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
        No bookings yet this session
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
        Book an appointment and it will appear here.
      </p>
      <Link href="/book" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "var(--gold)", color: "#0E0C09",
        borderRadius: "6px", padding: "10px 20px",
        fontSize: "13px", fontWeight: 700, textDecoration: "none",
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        Book now
      </Link>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; email: string } | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("bf_session");
      if (!s) { router.replace("/"); return; }
      setSession(JSON.parse(s));
      const b = sessionStorage.getItem("bf_bookings");
      if (b) setMyBookings(JSON.parse(b));
    } catch { router.replace("/"); }
  }, [router]);

  const totalSpend = useMemo(() => myBookings.reduce((sum, b) => sum + b.price, 0), [myBookings]);
  const all = [...myBookings, ...DEMO_BOOKINGS];
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, height: "58px",
        background: "rgba(14,12,9,0.96)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 100,
      }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", borderLeft: "1px solid var(--border)", paddingLeft: "10px" }}>My Bookings</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/book" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, textDecoration: "none" }}>Book now</Link>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name}</span>
          <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)",
            borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>Sign out</button>
        </div>
      </nav>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 120% at 0% 50%, rgba(184,152,90,0.07) 0%, transparent 60%)",
        }}/>
        {/* Subtle grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: "linear-gradient(rgba(184,152,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,152,90,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}/>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px 28px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)", opacity: 0.8 }}>
                  Nordklip Barbershop
                </span>
                <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Copenhagen</span>
              </div>
              <h1 className="serif" style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, color: "var(--text)", marginBottom: "5px", lineHeight: 1.1 }}>
                Welcome back, {session.name.split(" ")[0]}.
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{todayLabel}</p>
            </div>

            <Link href="/book" style={{
              background: "var(--gold)", color: "#0E0C09",
              borderRadius: "8px", padding: "11px 22px", fontSize: "13px", fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: "7px", textDecoration: "none",
              alignSelf: "flex-start", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Book appointment
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "36px" }}>
          <StatCard
            value={String(all.length)} label="Upcoming" sub="at Nordklip"
            accent="#B8985A" icon={<IconCalendar color="#B8985A"/>}
          />
          <StatCard
            value={String(myBookings.length)} label="Your bookings" sub="this session"
            accent="#7BA3C4" icon={<IconScissors color="#7BA3C4"/>}
          />
          <StatCard
            value={`€${totalSpend}`} label="Total spent" sub="this session"
            accent="#7BBFA5" icon={<IconCoins color="#7BBFA5"/>}
          />
        </div>

        {/* Your bookings this session */}
        <div style={{ marginBottom: "36px" }}>
          <SectionLabel count={myBookings.length}>
            Your bookings — this session
          </SectionLabel>
          {myBookings.length === 0 ? (
            <EmptyState/>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {myBookings.map((b, i) => <BookingCard key={i} booking={b} isNew={i === 0}/>)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
          <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            All upcoming
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}/>
        </div>

        {/* All upcoming */}
        <div>
          <SectionLabel aside={`${all.length} appointments`}>
            All upcoming at Nordklip
          </SectionLabel>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 90px",
            padding: "7px 18px 7px 0", marginBottom: "6px",
          }}>
            {[["", "pl-0"], ["Appointment", "pl-0"], ["Price", "text-right"]].map(([h, cls]) => (
              <span key={h} style={{
                fontSize: "9px", fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                textAlign: h === "Price" ? "right" : "left",
                paddingLeft: h === "Appointment" ? "18px" : 0,
              }}>{h}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {all.map((b, i) => (
              <BookingCard key={i} booking={b} isNew={i < myBookings.length && i === 0}/>
            ))}
          </div>
        </div>

        {/* Demo note */}
        <div style={{
          marginTop: "28px",
          padding: "13px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderLeft: "3px solid var(--border-strong)",
          borderRadius: "7px",
          display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--text-muted)" strokeWidth="1.2"/>
            <path d="M8 5.5v3.5M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo mode — </span>
            bookings made this session appear above. Data clears on tab close. In production, all appointments sync in real time across barbers and customers.
          </p>
        </div>
      </main>

      {/* Footer */}
      <div style={{ padding: "0 0 36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
        <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
        <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          Built by Sloth Studio
        </a>
      </div>
    </div>
  );
}
