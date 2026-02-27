"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bf_session")) router.replace("/book");
    } catch {}
  }, [router]);

  function validate() {
    if (mode === "signup" && !name.trim()) return "Please enter your name.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem("bf_session", JSON.stringify({
          name: mode === "signup" ? name.trim() : email.split("@")[0],
          email: email.trim(),
        }));
      } catch {}
      router.push("/book");
    }, 600);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── Left: Brand panel ─────────────────────────────── */}
      <div className="brand-panel" style={{
        flex: "0 0 44%", maxWidth: "44%",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "40px 48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(184,152,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,152,90,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}/>
        {/* Warm glow from bottom-left */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, width: "70%", height: "60%",
          background: "radial-gradient(ellipse at 0% 100%, rgba(184,152,90,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
        }}/>

        {/* Back link */}
        <div style={{ position: "relative", marginBottom: "auto" }}>
          <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "11px", color: "var(--text-muted)", textDecoration: "none",
            transition: "color 0.15s",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            nordklip.pages.dev
          </a>
        </div>

        {/* Main copy — vertically centered */}
        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 0 40px" }}>

          {/* Scissors mark */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ marginBottom: "28px", opacity: 0.8 }}>
            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <line x1="20" y1="4" x2="8.12" y2="15.88"/>
            <line x1="14.47" y1="14.48" x2="20" y2="20"/>
            <line x1="8.12" y1="8.12" x2="12" y2="12"/>
          </svg>

          <h1 className="serif" style={{
            fontSize: "clamp(34px, 3.5vw, 50px)", fontWeight: 700,
            color: "var(--text)", lineHeight: 1.06, marginBottom: "6px",
            letterSpacing: "-0.01em",
          }}>
            Nordklip
          </h1>
          <h2 className="serif" style={{
            fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 400,
            color: "var(--gold)", lineHeight: 1.1, marginBottom: "24px",
            letterSpacing: "0.01em",
          }}>
            Barbershop
          </h2>

          <p style={{
            fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7,
            maxWidth: "300px", marginBottom: "40px",
          }}>
            Book your next appointment online. Pick your barber, your service, and a time that works for you.
          </p>

          {/* Shop details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
            {[
              {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                text: "Kongensgade 14, 1264 Copenhagen K"
              },
              {
                path: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3v7l4.5 2.5",
                text: "Mon–Fri 10:00–19:00 · Sat 09:00–17:00"
              },
            ].map(({ path, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, opacity: 0.65 }}>
                  <path d={path}/>
                </svg>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer credits */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Booking by</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "10px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
            Sloth Studio
          </a>
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "3px", padding: "1px 6px", marginLeft: "6px" }}>Demo</span>
        </div>
      </div>

      {/* ── Right: Form panel ─────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
      }}>
        {/* Subtle glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
          width: "400px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(184,152,90,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        <div style={{ width: "100%", maxWidth: "360px", position: "relative" }}>

          {/* Mobile-only logo */}
          <div className="mobile-logo" style={{ textAlign: "center", marginBottom: "36px" }}>
            <div className="serif" style={{ fontSize: "26px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Barbershop · Copenhagen</p>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {mode === "signup" ? "One account for all your Nordklip bookings." : "Sign in to manage your appointments."}
            </p>
          </div>

          {/* Mode switcher tabs */}
          <div style={{
            display: "flex", background: "var(--surface-2)",
            border: "1px solid var(--border-strong)", borderRadius: "8px",
            padding: "3px", marginBottom: "24px",
          }}>
            {(["signup", "login"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "8px 14px",
                background: mode === m ? "var(--surface)" : "transparent",
                border: mode === m ? "1px solid var(--border-strong)" : "1px solid transparent",
                borderRadius: "6px", cursor: "pointer",
                fontSize: "13px", fontWeight: mode === m ? 600 : 400,
                color: mode === m ? "var(--text)" : "var(--text-muted)",
                transition: "all 0.15s",
              }}>
                {m === "signup" ? "Sign up" : "Sign in"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                  Full name
                </label>
                <input type="text" placeholder="Marcus Holst" value={name} onChange={e => setName(e.target.value)}/>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                Email
              </label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                Password
              </label>
              <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            {error && <p style={{ fontSize: "13px", color: "var(--red)", lineHeight: 1.5, margin: 0 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              marginTop: "6px", width: "100%",
              background: "var(--gold)", color: "#0E0C09",
              border: "none", borderRadius: "7px",
              padding: "14px 20px", fontSize: "14px", fontWeight: 700,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "default" : "pointer",
              letterSpacing: "0.01em",
              transition: "opacity 0.15s, box-shadow 0.15s",
              boxShadow: loading ? "none" : "0 4px 24px rgba(184,152,90,0.28)",
            }}>
              {loading ? "Just a moment..." : mode === "signup" ? "Create account & continue" : "Sign in & continue"}
            </button>
          </form>

          <p style={{ marginTop: "18px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
            {mode === "signup" ? "Already have an account?" : "No account yet?"}{" "}
            <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} style={{
              background: "none", border: "none", color: "var(--gold)",
              fontSize: "13px", fontWeight: 600, padding: 0, cursor: "pointer",
            }}>
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>

          {/* Demo note */}
          <div style={{
            marginTop: "28px", padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "7px",
          }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Demo — </span>
              enter any name, email, and password. No data is stored. Session clears when you close this tab.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .brand-panel { display: none !important; }
          .mobile-logo { display: block !important; }
        }
        @media (min-width: 861px) {
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
