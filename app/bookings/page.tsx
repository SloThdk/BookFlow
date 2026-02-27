"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking { service: string; staff: string; date: string; time: string; name: string; price: number; createdAt: number; }

const DEMO_BOOKINGS: Booking[] = [
  { service: "Classic Cut",     staff: "Oliver Berg", date: "Tomorrow",   time: "10:30", name: "Marcus Holst", price: 35, createdAt: 0 },
  { service: "Beard Sculpt",    staff: "Marcus Lund", date: "Thu 20 Mar", time: "14:00", name: "Emil Strand",  price: 20, createdAt: 0 },
  { service: "Cut & Beard",     staff: "Emil Dahl",   date: "Fri 21 Mar", time: "11:00", name: "Sofia Krag",   price: 50, createdAt: 0 },
  { service: "Hot Towel Shave", staff: "Oliver Berg", date: "Sat 22 Mar", time: "13:30", name: "Marcus Holst", price: 28, createdAt: 0 },
];

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

  if (!session) return null;

  const all = [...myBookings, ...DEMO_BOOKINGS];

  const NavBar = () => (
    <nav style={{
      position: "sticky", top: 0, height: "58px",
      background: "rgba(14,12,9,0.95)", backdropFilter: "blur(12px)",
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
        <Link href="/book" style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Book now</Link>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name}</span>
        <button onClick={() => { try { sessionStorage.clear(); } catch {} router.push("/"); }} style={{
          background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)",
          borderRadius: "5px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
        }}>Sign out</button>
      </div>
    </nav>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <NavBar/>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="serif" style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>My bookings</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{session.name} &mdash; {session.email}</p>
          </div>
          <Link href="/book" style={{
            background: "var(--gold)", color: "#0E0C09",
            borderRadius: "6px", padding: "10px 22px", fontSize: "14px", fontWeight: 700,
            display: "inline-block",
          }}>
            Book appointment
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Total upcoming", value: all.length },
            { label: "Your bookings", value: myBookings.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "16px 18px" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-playfair)", marginBottom: "4px" }}>{value}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Your bookings this session */}
        {myBookings.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold-glow)" }}/>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Your bookings — this session</span>
            </div>
            {myBookings.map((b, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 70px 80px",
                gap: "12px", padding: "14px 20px", alignItems: "center",
                borderBottom: i < myBookings.length - 1 ? "1px solid var(--border)" : "none",
                background: i === 0 ? "rgba(184,152,90,0.03)" : "transparent",
              }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-playfair)" }}>{b.service}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.staff}</div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{b.date}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.time}</div>
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{b.name}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>€{b.price}</div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "3px", padding: "3px 8px", whiteSpace: "nowrap" }}>Confirmed</span>
              </div>
            ))}
          </div>
        )}

        {/* All upcoming */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>All upcoming at Nordklip</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{all.length} appointments</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 70px 80px", gap: "12px", padding: "10px 20px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
            {["Service", "Date", "Customer", "Price", "Status"].map(h => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>
          {all.map((b, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 70px 80px",
              gap: "12px", padding: "13px 20px", alignItems: "center",
              borderBottom: i < all.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{b.service}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.staff}</div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{b.date}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.time}</div>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{b.name}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>€{b.price}</div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Confirmed</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "6px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo: </span>
            Bookings made this session appear above. Data clears on tab close. In production, all appointments sync in real time.
          </p>
        </div>
      </main>

      <div style={{ textAlign: "center", padding: "0 0 32px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>·</span>
        <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          Built by Sloth Studio
        </a>
      </div>
    </div>
  );
}
