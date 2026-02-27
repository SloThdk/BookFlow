"use client";

import Link from "next/link";

// ─── Demo Data ─────────────────────────────────────────────────────────────────
const WEEK_REVENUE = [
  { day: "Man", date: "17 mar", revenue: 7840,  today: false },
  { day: "Tir", date: "18 mar", revenue: 9120,  today: false },
  { day: "Ons", date: "19 mar", revenue: 6580,  today: false },
  { day: "Tor", date: "20 mar", revenue: 11200, today: false },
  { day: "Fre", date: "21 mar", revenue: 13440, today: false },
  { day: "Lør", date: "22 mar", revenue: 9680,  today: false },
  { day: "I dag", date: "23 mar", revenue: 8760, today: true  },
];

const TODAY_APTS = [
  { time: "09:00", client: "Henrik Bruun",      service: "Hot Towel Shave", barber: "Marcus", dur: 40,  price: 220 },
  { time: "10:00", client: "Maja Lindström",    service: "Farve & Stil",    barber: "Sofia",  dur: 90,  price: 550 },
  { time: "11:30", client: "Lars Thomsen",      service: "Classic Cut",     barber: "Emil",   dur: 45,  price: 260 },
  { time: "13:00", client: "Oliver Brink",      service: "Cut & Beard",     barber: "Marcus", dur: 70,  price: 390 },
  { time: "14:30", client: "Stine Krogh",       service: "Farve & Stil",    barber: "Sofia",  dur: 90,  price: 550 },
  { time: "15:30", client: "Adam Schäfer",      service: "Cut & Beard",     barber: "Emil",   dur: 70,  price: 390 },
  { time: "17:00", client: "Jesper Winther",    service: "Classic Cut",     barber: "Marcus", dur: 45,  price: 260 },
];

const STAFF = [
  {
    name: "Marcus Holst", role: "Senior Barber",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
    bookings: 38, revenue: 10140, fillRate: 92, topService: "Classic Cut",
  },
  {
    name: "Emil Strand", role: "Barber",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    bookings: 31, revenue: 7890, fillRate: 84, topService: "Beard Sculpt",
  },
  {
    name: "Sofia Krag", role: "Barber & Farvespecialist",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
    bookings: 22, revenue: 12100, fillRate: 96, topService: "Farve & Stil",
  },
];

const TOP_SERVICES = [
  { name: "Farve & Stil",    revenue: 12100, bookings: 22, color: "#C49BBF" },
  { name: "Classic Cut",     revenue: 9880,  bookings: 38, color: "#B8985A" },
  { name: "Cut & Beard",     revenue: 7020,  bookings: 18, color: "#C4977A" },
  { name: "Beard Sculpt",    revenue: 4680,  bookings: 26, color: "#7BA3C4" },
  { name: "Hot Towel Shave", revenue: 3080,  bookings: 14, color: "#7BBFA5" },
];

const SERVICE_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4",
  "Cut & Beard": "#C4977A", "Hot Towel Shave": "#7BBFA5",
  "Junior Cut": "#A0B89A",  "Farve & Stil": "#C49BBF",
};

const MONTH_REVENUE = 86440;

function fmtDKK(n: number) {
  return n.toLocaleString("da-DK") + " kr.";
}

function isPast(time: string) {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function OwnerPage() {
  const todayRevenue = TODAY_APTS.reduce((s, a) => s + a.price, 0);
  const weekRevenue  = WEEK_REVENUE.reduce((s, d) => s + d.revenue, 0);
  const maxBar       = Math.max(...WEEK_REVENUE.map(d => d.revenue));
  const maxSvc       = TOP_SERVICES[0].revenue;
  const totalSvcRev  = TOP_SERVICES.reduce((s, s2) => s + s2.revenue, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-inter)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, height: "60px", zIndex: 100,
        background: "rgba(14,12,9,0.97)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <span className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
          </a>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "rgba(184,152,90,0.1)", border: "1px solid var(--gold-border)",
            color: "var(--gold)", borderRadius: "4px", padding: "3px 8px",
          }}>Ejer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/admin" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>Holdplan</Link>
          <Link href="/bookings" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>Kundevisning</Link>
          <Link href="/book" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Ny booking</Link>
        </div>
      </nav>

      <div style={{ padding: "32px 40px 80px", maxWidth: "1280px", margin: "0 auto" }}>

        {/* ── Page title ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }}>
          <h1 className="serif" style={{ fontSize: "26px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
            Ejeroversigt
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nordklip Barbershop &mdash; Kongensgade 14, K&oslash;benhavn
          </p>
        </div>

        {/* ── KPI strip ──────────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px",
          marginBottom: "28px",
        }}>
          {[
            { label: "Omsætning i dag",   value: fmtDKK(todayRevenue),  sub: `${TODAY_APTS.filter(a => isPast(a.time)).length} af ${TODAY_APTS.length} gennemført`,    accent: "var(--gold)" },
            { label: "Aftaler i dag",     value: `${TODAY_APTS.length}`, sub: `${TODAY_APTS.filter(a => !isPast(a.time)).length} resterende i dag`,                     accent: "var(--text)" },
            { label: "Omsætning — uge",   value: fmtDKK(weekRevenue),   sub: "Man 17 — I dag",                                                                          accent: "var(--gold)" },
            { label: "Omsætning — måned", value: fmtDKK(MONTH_REVENUE), sub: "Marts 2026",                                                                              accent: "var(--gold)" },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} style={{
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "10px", padding: "20px 22px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>{label}</div>
              <div className="serif" style={{ fontSize: "22px", fontWeight: 700, color: accent, lineHeight: 1, marginBottom: "6px" }}>{value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", alignItems: "start", marginBottom: "16px" }}>

          {/* ── Revenue chart ─────────────────────────────────── */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "10px", overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Omsætning — denne uge</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{fmtDKK(weekRevenue)} i alt</div>
              </div>
              <div style={{
                fontSize: "11px", fontWeight: 600, color: "var(--gold)",
                background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
                borderRadius: "5px", padding: "4px 10px",
              }}>Marts 2026</div>
            </div>
            <div style={{ padding: "24px 22px" }}>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px" }}>
                {WEEK_REVENUE.map((d, i) => {
                  const pct = (d.revenue / maxBar) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <div style={{
                          width: "100%", height: `${pct}%`,
                          background: d.today
                            ? "linear-gradient(180deg, var(--gold) 0%, rgba(184,152,90,0.4) 100%)"
                            : "rgba(184,152,90,0.2)",
                          border: `1px solid ${d.today ? "var(--gold)" : "var(--gold-border)"}`,
                          borderRadius: "4px 4px 0 0",
                          minHeight: "4px",
                          transition: "height 0.3s",
                          position: "relative",
                        }}>
                          {d.today && (
                            <div style={{
                              position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)",
                              fontSize: "9px", fontWeight: 700, color: "var(--gold)", whiteSpace: "nowrap",
                            }}>{fmtDKK(d.revenue)}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: d.today ? 700 : 500, color: d.today ? "var(--gold)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{d.day}</div>
                    </div>
                  );
                })}
              </div>
              {/* X axis line */}
              <div style={{ height: "1px", background: "var(--border)", marginTop: "4px" }}/>
            </div>
          </div>

          {/* ── Top services ──────────────────────────────────── */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border-strong)",
            borderRadius: "10px", overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Ydelser — omsætning</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Denne måned</div>
            </div>
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {TOP_SERVICES.map((s, i) => {
                const pct = Math.round((s.revenue / totalSvcRev) * 100);
                const barPct = (s.revenue / maxSvc) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{s.name}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{fmtDKK(s.revenue)}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.bookings} aftaler · {pct}%</div>
                      </div>
                    </div>
                    <div style={{ height: "4px", background: "var(--surface-2)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, background: s.color, borderRadius: "2px", opacity: 0.7 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Today's schedule ───────────────────────────────────── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
        }}>
          <div style={{
            padding: "18px 22px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Dagens program</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Søndag 23. marts · {TODAY_APTS.length} aftaler · {fmtDKK(todayRevenue)}</div>
            </div>
            <Link href="/admin" style={{
              fontSize: "12px", color: "var(--gold)", fontWeight: 600, textDecoration: "none",
              background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
              borderRadius: "5px", padding: "6px 14px",
            }}>Vis holdplan</Link>
          </div>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 160px 120px 100px 90px",
            padding: "10px 22px", background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
          }}>
            {["Tid", "Kunde", "Ydelse", "Barber", "Varighed", "Pris"].map(h => (
              <div key={h} style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{h}</div>
            ))}
          </div>
          {TODAY_APTS.map((a, i) => {
            const done = isPast(a.time);
            const color = SERVICE_COLOR[a.service] || "var(--gold)";
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 160px 120px 100px 90px",
                padding: "14px 22px", alignItems: "center",
                borderBottom: i < TODAY_APTS.length - 1 ? "1px solid var(--border)" : "none",
                opacity: done ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: done ? "var(--text-muted)" : "var(--text)" }}>{a.time}</div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{a.client}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: color, flexShrink: 0 }}/>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{a.service}</span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{a.barber}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.dur} min</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: done ? "var(--text-muted)" : "var(--gold)" }}>{a.price} kr.</div>
              </div>
            );
          })}
        </div>

        {/* ── Staff performance ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {STAFF.map((s, i) => (
            <div key={i} style={{
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "10px", overflow: "hidden",
            }}>
              <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                  <img src={s.photo} alt={s.name} style={{
                    width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover",
                    border: "1px solid var(--border-strong)", display: "block",
                  }}/>
                  <div>
                    <div className="serif" style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--gold)" }}>{s.role}</div>
                  </div>
                </div>
                {/* Fill rate bar */}
                <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Belægning</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: s.fillRate >= 90 ? "#4ade80" : "var(--gold)" }}>{s.fillRate}%</span>
                </div>
                <div style={{ height: "5px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
                  <div style={{
                    height: "100%", width: `${s.fillRate}%`,
                    background: s.fillRate >= 90
                      ? "linear-gradient(90deg, #4ade80, #22c55e)"
                      : "linear-gradient(90deg, var(--gold), rgba(184,152,90,0.5))",
                    borderRadius: "3px",
                  }}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 22px", gap: "8px" }}>
                {[
                  { label: "Aftaler", value: `${s.bookings}` },
                  { label: "Omsætning", value: `${(s.revenue / 1000).toFixed(1)}k` },
                  { label: "Top ydelse", value: s.topService.split(" ")[0] },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div className="serif" style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "3px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Demo note */}
      <div style={{
        paddingBottom: "40px", display: "flex", justifyContent: "center",
        alignItems: "center", flexDirection: "column", gap: "10px",
      }}>
        <div style={{
          display: "flex", gap: "8px", alignItems: "center",
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderRadius: "8px", padding: "10px 18px",
          fontSize: "11px", color: "var(--text-muted)", maxWidth: "520px", textAlign: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--text-muted)" strokeWidth="1.2"/>
            <path d="M8 5.5v3.5M8 11v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span><span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Ejerdemo — </span>
          dette er hvad butiksejeren ser. I produktion opdateres alle tal i realtid fra det aktive bookingsystem.</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
            Bygget af Sloth Studio
          </a>
        </div>
      </div>
    </div>
  );
}
