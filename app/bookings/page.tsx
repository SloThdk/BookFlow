"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking { service: string; staff: string; date: string; time: string; name: string; price: number; createdAt: number; }

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

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, isNew = false }: { booking: Booking; isNew?: boolean }) {
  const photo = STAFF_PHOTOS[booking.staff];
  const initials = booking.staff.split(" ").map(n => n[0]).join("");
  const accent = SERVICE_ACCENTS[booking.service] || "var(--gold)";

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderLeft: `3px solid ${accent}`,
      borderRadius: "9px",
      display: "flex",
      alignItems: "stretch",
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}>
      {/* Left: barber + service */}
      <div style={{ flex: 1, padding: "16px 18px", display: "flex", gap: "14px", alignItems: "center", minWidth: 0 }}>
        {photo ? (
          <img src={photo} alt={booking.staff} style={{
            width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover",
            border: "2px solid var(--border-strong)", flexShrink: 0,
          }}/>
        ) : (
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "var(--surface-2)", border: "2px solid var(--border-strong)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>{initials}</span>
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: "14px", fontWeight: 700, color: "var(--text)",
            fontFamily: "var(--font-playfair)", marginBottom: "3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{booking.service}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{booking.staff}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", opacity: 0.7 }}>{booking.name}</div>
        </div>
      </div>

      {/* Middle: date + time */}
      <div style={{
        padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center",
        borderLeft: "1px solid var(--border)", minWidth: "120px", flexShrink: 0,
      }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{booking.date}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{booking.time}</div>
      </div>

      {/* Right: price + status */}
      <div style={{
        padding: "16px 16px", display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "flex-end", borderLeft: "1px solid var(--border)", gap: "6px",
        minWidth: "88px", flexShrink: 0,
      }}>
        <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>€{booking.price}</div>
        {isNew ? (
          <span style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            color: "#FBBF24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.28)",
            borderRadius: "3px", padding: "2px 7px", whiteSpace: "nowrap",
          }}>New</span>
        ) : (
          <span style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            color: "var(--gold)", background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
            borderRadius: "3px", padding: "2px 7px", whiteSpace: "nowrap",
          }}>Confirmed</span>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", background: "var(--surface)", border: "1px solid var(--border-strong)",
      borderRadius: "10px", textAlign: "center",
    }}>
      <div style={{
        width: "52px", height: "52px", borderRadius: "12px",
        background: "var(--surface-2)", border: "1px solid var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>No bookings yet this session</p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Book an appointment and it will appear here.</p>
      <Link href="/book" style={{
        background: "var(--gold)", color: "#0E0C09",
        borderRadius: "6px", padding: "10px 22px", fontSize: "14px", fontWeight: 700,
        display: "inline-block", textDecoration: "none",
      }}>Book now</Link>
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

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="serif" style={{ fontSize: "28px", fontWeight: 700, marginBottom: "5px" }}>My bookings</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name} &mdash; {session.email}</p>
          </div>
          <Link href="/book" style={{
            background: "var(--gold)", color: "#0E0C09",
            borderRadius: "7px", padding: "10px 22px", fontSize: "14px", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Book appointment
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "36px" }}>
          {[
            { label: "Total upcoming", value: String(all.length), sub: "at Nordklip" },
            { label: "Your bookings", value: String(myBookings.length), sub: "this session" },
            { label: "Total spent", value: `€${totalSpend}`, sub: "this session" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "9px", padding: "18px 20px",
            }}>
              <div className="serif" style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", marginBottom: "4px", lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "2px" }}>{label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Your bookings this session */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold-glow)" }}/>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Your bookings — this session</span>
            {myBookings.length > 0 && (
              <span style={{
                fontSize: "10px", fontWeight: 700, color: "var(--gold)", background: "var(--gold-dim)",
                border: "1px solid var(--gold-border)", borderRadius: "9999px",
                padding: "1px 7px", marginLeft: "4px",
              }}>{myBookings.length}</span>
            )}
          </div>

          {myBookings.length === 0 ? (
            <EmptyState/>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {myBookings.map((b, i) => <BookingCard key={i} booking={b} isNew={i === 0}/>)}
            </div>
          )}
        </div>

        {/* All upcoming at Nordklip */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)" }}/>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>All upcoming at Nordklip</span>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{all.length} appointments</span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 88px",
            gap: "12px",
            padding: "8px 18px 8px 21px",
            marginBottom: "4px",
          }}>
            {["Appointment", "Date & time", "Price"].map(h => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {all.map((b, i) => {
              const isUserBooking = i < myBookings.length;
              return <BookingCard key={i} booking={b} isNew={isUserBooking && i === 0}/>;
            })}
          </div>
        </div>

        {/* Demo note */}
        <div style={{ marginTop: "24px", padding: "13px 16px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "7px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="8" cy="8" r="7" stroke="var(--text-muted)" strokeWidth="1.2"/>
            <path d="M8 5v4M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo: </span>
            Bookings made this session appear above. Data clears on tab close. In production, all appointments sync in real time.
          </p>
        </div>
      </main>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "0 0 36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
        <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          Built by Sloth Studio
        </a>
      </div>
    </div>
  );
}
