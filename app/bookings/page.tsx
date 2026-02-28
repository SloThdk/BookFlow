"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  service: string; staff: string; date: string; time: string;
  name: string; price: number; createdAt: number;
}

const SERVICE_DURATIONS: Record<string, number> = {
  "Classic Cut": 45, "Beard Sculpt": 30, "Cut & Beard": 70,
  "Hot Towel Shave": 40, "Junior Cut": 30, "Farve & Stil": 90,
};

const INITIAL_DEMO: Booking[] = [
  { service: "Classic Cut",     staff: "Marcus Holst", date: "I morgen",   time: "11:00", name: "", price: 260, createdAt: 0 },
  { service: "Beard Sculpt",    staff: "Emil Strand",  date: "Tor 20 mar", time: "14:00", name: "", price: 180, createdAt: 0 },
  { service: "Farve & Stil",    staff: "Sofia Krag",   date: "Fre 21 mar", time: "11:00", name: "", price: 550, createdAt: 0 },
  { service: "Hot Towel Shave", staff: "Marcus Holst", date: "Lør 22 mar", time: "13:30", name: "", price: 220, createdAt: 0 },
];

const STAFF_PHOTOS: Record<string, string> = {
  "Marcus Holst": "https://images.pexels.com/photos/30004312/pexels-photo-30004312.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face",
  "Emil Strand":  "https://images.pexels.com/photos/30004318/pexels-photo-30004318.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face",
  "Sofia Krag":   "https://images.pexels.com/photos/30004322/pexels-photo-30004322.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&crop=face",
};

function BookingCard({ booking, isNew = false, onCancel, onViewContract }: {
  booking: Booking; isNew?: boolean; onCancel?: () => void; onViewContract?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const photo = STAFF_PHOTOS[booking.staff];
  const initials = booking.staff.split(" ").map((n: string) => n[0]).join("");
  const isSpecialDate = booking.date === "I morgen" || booking.date === "I dag";
  const parts = booking.date.split(" ");

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: "10px",
      display: "flex", alignItems: "stretch",
      overflow: "hidden",
      opacity: confirming ? 0.75 : 1, transition: "opacity 0.15s",
    }}>
      {/* Date block */}
      <div style={{
        width: "110px", flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "28px 14px",
        background: "var(--surface-2)", gap: "3px",
      }}>
        {isSpecialDate ? (
          <>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)" }}>{booking.date}</span>
            <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginTop: "4px" }}>{booking.time}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{parts[0]}</span>
            <span className="serif" style={{ fontSize: "34px", fontWeight: 700, color: "var(--text)", lineHeight: 1, marginTop: "1px" }}>{parts[1]}</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{parts[2]}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "10px" }}>{booking.time}</span>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: "26px 32px",
        display: "flex", alignItems: "center", gap: "22px", minWidth: 0,
      }}>
        {photo ? (
          <img src={photo} alt={booking.staff} style={{
            width: "66px", height: "66px", borderRadius: "50%", objectFit: "cover",
            flexShrink: 0, display: "block", border: "1px solid var(--border-strong)",
          }}/>
        ) : (
          <div style={{
            width: "66px", height: "66px", borderRadius: "50%", flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-muted)" }}>{initials}</span>
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700,
            color: "var(--text)", marginBottom: "7px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{booking.service}</div>
          <div style={{ fontSize: "14px", color: "var(--gold)", fontWeight: 500 }}>{booking.staff}</div>
        </div>
      </div>

      {/* Price + status + cancel */}
      <div style={{
        padding: "26px 28px", flexShrink: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", justifyContent: "center", gap: "10px",
        borderLeft: "1px solid var(--border)",
      }}>
        {confirming ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Annuller aftale?</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setConfirming(false)} style={{
                background: "transparent", border: "1px solid var(--border-strong)",
                color: "var(--text-muted)", borderRadius: "5px", padding: "5px 10px",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}>Behold</button>
              <button onClick={onCancel} style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", borderRadius: "5px", padding: "5px 10px",
                fontSize: "11px", fontWeight: 700, cursor: "pointer",
              }}>Ja, annuller</button>
            </div>
          </div>
        ) : (
          <>
            <span className="serif" style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>{booking.price} kr.</span>
            <span style={{
              fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
              color: isNew ? "var(--text)" : "var(--gold)",
              background: isNew ? "rgba(245,239,228,0.08)" : "var(--gold-dim)",
              border: `1px solid ${isNew ? "rgba(245,239,228,0.18)" : "var(--gold-border)"}`,
              borderRadius: "4px", padding: "3px 9px",
            }}>{isNew ? "Ny" : "Bekræftet"}</span>
            {onViewContract && (
              <button onClick={onViewContract}
                style={{
                  background: "none", border: "1px solid var(--gold-border)",
                  color: "var(--gold)", borderRadius: "5px", padding: "4px 10px",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  letterSpacing: "0.03em", whiteSpace: "nowrap",
                }}
              >Se kontrakt</button>
            )}
            {onCancel && (
              <button onClick={() => setConfirming(true)}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                style={{
                  background: "none", border: "none", padding: "2px 0",
                  cursor: "pointer", color: "var(--text-muted)",
                  fontSize: "11px", fontWeight: 500,
                  textDecoration: "underline", textUnderlineOffset: "3px",
                  transition: "color 0.15s", marginTop: "4px",
                }}
              >Annuller</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "60px 24px", textAlign: "center",
      background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "10px",
    }}>
      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Ingen kommende aftaler</p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>Klar når du er det.</p>
      <Link href="/book" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "var(--gold)", color: "#0E0C09", borderRadius: "6px",
        padding: "11px 24px", fontSize: "13px", fontWeight: 700, textDecoration: "none",
      }}>Book en tid</Link>
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; email: string } | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [demoBookings, setDemoBookings] = useState<Booking[]>(INITIAL_DEMO);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("bf_session");
      if (!s) { router.replace("/"); return; }
      setSession(JSON.parse(s));
      const b = sessionStorage.getItem("bf_bookings");
      if (b) setMyBookings(JSON.parse(b));
    } catch { router.replace("/"); }
  }, [router]);

  function cancelMine(i: number) {
    const updated = myBookings.filter((_, idx) => idx !== i);
    setMyBookings(updated);
    try { sessionStorage.setItem("bf_bookings", JSON.stringify(updated)); } catch {}
  }

  function cancelDemo(i: number) {
    setDemoBookings(d => d.filter((_, idx) => idx !== i));
  }

  function viewContract(booking: Booking) {
    if (!session) return;
    const ref = "NK-" + Math.abs(booking.service.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)).toString(36).toUpperCase().slice(0, 4) + booking.time.replace(":", "");
    const contractData = {
      clientName: session.name,
      clientEmail: session.email,
      service: { name: booking.service, price: booking.price, duration: SERVICE_DURATIONS[booking.service] ?? 45 },
      staffMember: { name: booking.staff },
      dateStr: booking.date,
      time: booking.time,
      bookingRef: ref,
    };
    try { sessionStorage.setItem("bf_pending_contract", JSON.stringify(contractData)); } catch {}
    window.open("/kontrakt", "_blank");
  }

  const all = [...myBookings, ...demoBookings];

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
          }}>Log ud</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--border)",
        minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&fit=crop&crop=center)",
          backgroundSize: "cover", backgroundPosition: "center 35%",
        }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(14,12,9,0.72) 0%, rgba(14,12,9,0.88) 100%)" }}/>
        <div style={{ position: "relative", width: "100%", padding: "36px 48px" }}>
          <h1 className="serif" style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Kommende aftaler</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nordklip Barbershop &mdash; København</p>
        </div>
      </div>

      <main style={{ padding: "36px 48px 80px" }}>
        {all.length === 0 ? (
          <EmptyState/>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myBookings.map((b, i) => (
              <BookingCard key={`mine-${i}`} booking={b} isNew={i === 0} onCancel={() => cancelMine(i)} onViewContract={() => viewContract(b)}/>
            ))}
            {demoBookings.map((b, i) => (
              <BookingCard key={`demo-${i}`} booking={b} onCancel={() => cancelDemo(i)} onViewContract={() => viewContract(b)}/>
            ))}
          </div>
        )}
      </main>

      <div style={{ paddingBottom: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
        <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
        <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          Bygget af Sloth Studio
        </a>
      </div>
    </div>
  );
}
