"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  service: string; staff: string; date: string; time: string;
  name: string; price: number; createdAt: number;
}

const DEMO_BOOKINGS: Booking[] = [
  { service: "Classic Cut",     staff: "Marcus Holst", date: "Tomorrow",   time: "11:00", name: "", price: 35, createdAt: 0 },
  { service: "Beard Sculpt",    staff: "Emil Strand",  date: "Thu 20 Mar", time: "14:00", name: "", price: 24, createdAt: 0 },
  { service: "Color & Style",   staff: "Sofia Krag",   date: "Fri 21 Mar", time: "11:00", name: "", price: 75, createdAt: 0 },
  { service: "Hot Towel Shave", staff: "Marcus Holst", date: "Sat 22 Mar", time: "13:30", name: "", price: 30, createdAt: 0 },
];

const STAFF_PHOTOS: Record<string, string> = {
  "Marcus Holst": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
  "Emil Strand":  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  "Sofia Krag":   "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
};

const SERVICE_ACCENTS: Record<string, string> = {
  "Classic Cut":     "#B8985A",
  "Beard Sculpt":    "#7BA3C4",
  "Cut & Beard":     "#C4977A",
  "Hot Towel Shave": "#7BBFA5",
  "Junior Cut":      "#A0B89A",
  "Color & Style":   "#C49BBF",
};

function BookingRow({ booking, isNew = false }: { booking: Booking; isNew?: boolean }) {
  const photo = STAFF_PHOTOS[booking.staff];
  const initials = booking.staff.split(" ").map((n: string) => n[0]).join("");
  const accent = SERVICE_ACCENTS[booking.service] || "#B8985A";
  const isSpecialDate = booking.date === "Tomorrow" || booking.date === "Today";
  const parts = booking.date.split(" ");

  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "16px 20px",
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderLeft: `3px solid ${accent}`,
      borderRadius: "8px",
      gap: "16px",
    }}>
      {/* Date */}
      <div style={{ width: "54px", flexShrink: 0, textAlign: "center" }}>
        {isSpecialDate ? (
          <>
            <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent }}>{booking.date}</div>
            <div className="serif" style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", lineHeight: 1.1, marginTop: "2px" }}>{booking.time}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{parts[0]}</div>
            <div className="serif" style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginTop: "1px" }}>{parts[1]}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{parts[2]}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px" }}>{booking.time}</div>
          </>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "44px", background: "var(--border)", flexShrink: 0 }}/>

      {/* Barber photo */}
      <div style={{ flexShrink: 0 }}>
        {photo ? (
          <img src={photo} alt={booking.staff} style={{
            width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover",
            border: `2px solid ${accent}50`, display: "block",
          }}/>
        ) : (
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "var(--surface-2)", border: `2px solid var(--border-strong)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>{initials}</span>
          </div>
        )}
      </div>

      {/* Service + barber */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "15px", fontWeight: 700, color: "var(--text)",
          fontFamily: "var(--font-playfair)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{booking.service}</div>
        <div style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 500, marginTop: "2px" }}>{booking.staff}</div>
      </div>

      {/* Price + badge */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div className="serif" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>€{booking.price}</div>
        <div style={{
          marginTop: "4px", display: "inline-block",
          fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          color: isNew ? accent : "var(--gold)",
          background: isNew ? `${accent}15` : "var(--gold-dim)",
          border: `1px solid ${isNew ? `${accent}40` : "var(--gold-border)"}`,
          borderRadius: "4px", padding: "2px 7px",
        }}>{isNew ? "New" : "Confirmed"}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "48px 24px", textAlign: "center",
      background: "var(--surface)", border: "1px solid var(--border-strong)",
      borderRadius: "8px",
    }}>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
        No upcoming appointments
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Ready when you are.
      </p>
      <Link href="/book" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "var(--gold)", color: "#0E0C09",
        borderRadius: "6px", padding: "10px 22px",
        fontSize: "13px", fontWeight: 700, textDecoration: "none",
      }}>
        Book a visit
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M3 11L11 3M11 3H6M11 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}

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

  const all = [...myBookings, ...DEMO_BOOKINGS];

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, height: "58px",
        background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 100,
      }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none" }}>
          <span className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/book" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, textDecoration: "none" }}>Book again</Link>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{session.name}</span>
          <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-muted)",
            borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>Sign out</button>
        </div>
      </nav>

      {/* Page title */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 0" }}>
        <h1 className="serif" style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          Upcoming appointments
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nordklip Barbershop, Copenhagen</p>
      </div>

      {/* List */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 24px 80px" }}>
        {all.length === 0 ? (
          <EmptyState/>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {all.map((b, i) => (
              <BookingRow key={i} booking={b} isNew={i < myBookings.length}/>
            ))}
          </div>
        )}

        {/* Book again button */}
        {all.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <Link href="/book" style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "var(--gold)", color: "#0E0C09",
              borderRadius: "7px", padding: "11px 24px",
              fontSize: "13px", fontWeight: 700, textDecoration: "none",
            }}>
              Book another visit
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M3 11L11 3M11 3H6M11 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

        {/* Demo note */}
        <div style={{
          marginTop: "36px", padding: "12px 16px",
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderLeft: "3px solid var(--border-strong)", borderRadius: "6px",
          display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--text-muted)" strokeWidth="1.2"/>
            <path d="M8 5.5v3.5M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo — </span>
            bookings you make this session appear here. In production, appointments sync in real time across barbers and customers.
          </p>
        </div>
      </main>

      {/* Footer */}
      <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
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
