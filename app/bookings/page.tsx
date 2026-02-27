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

function BookingCard({ booking, isNew = false }: { booking: Booking; isNew?: boolean }) {
  const photo = STAFF_PHOTOS[booking.staff];
  const initials = booking.staff.split(" ").map((n: string) => n[0]).join("");
  const isSpecialDate = booking.date === "Tomorrow" || booking.date === "Today";
  const parts = booking.date.split(" ");

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: "10px",
      display: "flex",
      alignItems: "stretch",
      overflow: "hidden",
    }}>
      {/* Date block */}
      <div style={{
        width: "90px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px",
        background: "var(--surface-2)",
        gap: "3px",
      }}>
        {isSpecialDate ? (
          <>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)" }}>{booking.date}</span>
            <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginTop: "4px" }}>{booking.time}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{parts[0]}</span>
            <span className="serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginTop: "1px" }}>{parts[1]}</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{parts[2]}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "8px" }}>{booking.time}</span>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        minWidth: 0,
      }}>
        {/* Barber photo */}
        {photo ? (
          <img src={photo} alt={booking.staff} style={{
            width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover",
            flexShrink: 0, display: "block",
            border: "1px solid var(--border-strong)",
          }}/>
        ) : (
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-muted)" }}>{initials}</span>
          </div>
        )}

        {/* Text */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "17px", fontWeight: 700,
            color: "var(--text)",
            marginBottom: "5px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{booking.service}</div>
          <div style={{ fontSize: "13px", color: "var(--gold)", fontWeight: 500 }}>{booking.staff}</div>
        </div>
      </div>

      {/* Price + status */}
      <div style={{
        padding: "20px 24px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "8px",
        borderLeft: "1px solid var(--border)",
      }}>
        <span className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>€{booking.price}</span>
        <span style={{
          fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
          color: isNew ? "var(--text)" : "var(--gold)",
          background: isNew ? "rgba(245,239,228,0.08)" : "var(--gold-dim)",
          border: `1px solid ${isNew ? "rgba(245,239,228,0.18)" : "var(--gold-border)"}`,
          borderRadius: "4px", padding: "3px 9px", whiteSpace: "nowrap",
        }}>{isNew ? "New" : "Confirmed"}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "60px 24px", textAlign: "center",
      background: "var(--surface)", border: "1px solid var(--border-strong)",
      borderRadius: "10px",
    }}>
      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
        No upcoming appointments
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>
        Ready when you are.
      </p>
      <Link href="/book" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "var(--gold)", color: "#0E0C09",
        borderRadius: "6px", padding: "11px 24px",
        fontSize: "13px", fontWeight: 700, textDecoration: "none",
      }}>
        Book a visit
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
        position: "sticky", top: 0, height: "60px",
        background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", zIndex: 100,
      }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <span className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/book" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, textDecoration: "none" }}>Book</Link>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{session.name}</span>
          <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-muted)",
            borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}>Sign out</button>
        </div>
      </nav>

      {/* Hero header */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--border)",
        minHeight: "160px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&fit=crop&crop=center)",
          backgroundSize: "cover", backgroundPosition: "center 35%",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,12,9,0.72) 0%, rgba(14,12,9,0.88) 100%)",
        }}/>
        <div style={{ position: "relative", width: "100%", maxWidth: "860px", padding: "36px 32px" }}>
          <h1 className="serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
            Upcoming appointments
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nordklip Barbershop &mdash; Copenhagen</p>
        </div>
      </div>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 32px 80px" }}>

        {/* List */}
        {all.length === 0 ? (
          <EmptyState/>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {all.map((b, i) => (
              <BookingCard key={i} booking={b} isNew={i < myBookings.length}/>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <div style={{ paddingBottom: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
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
