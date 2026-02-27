"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    }, 500);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      position: "relative",
    }}>
      {/* Subtle warm glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(184,152,90,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back to site link */}
      <div style={{ position: "absolute", top: "24px", left: "24px" }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          nordklip.pages.dev
        </a>
      </div>

      {/* Demo pill */}
      <div style={{ position: "absolute", top: "24px", right: "24px" }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border-strong)",
          borderRadius: "4px", padding: "3px 9px",
        }}>
          Demo
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: "380px",
        background: "var(--surface)", border: "1px solid var(--border-strong)",
        borderRadius: "12px", padding: "40px 36px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            border: "1px solid var(--gold-border)",
            background: "var(--gold-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9c0-3.9 3.6-7 8-7h2c4.4 0 8 3.1 8 7v2c0 4.4-3.6 8-8 8h-2C6.6 19 3 15.4 3 11V9z"/>
              <path d="M8 14c1 1.5 2 2 4 2s3-.5 4-2"/>
            </svg>
          </div>
          <div className="serif" style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
            Nordklip
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {mode === "signup" ? "Create an account to book" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Your name
              </label>
              <input type="text" placeholder="e.g. Marcus Holst" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Email
            </label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Password
            </label>
            <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p style={{ fontSize: "13px", color: "var(--red)", lineHeight: 1.5 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            marginTop: "6px",
            background: "var(--gold)", color: "#0E0C09",
            border: "none", borderRadius: "6px",
            padding: "13px", fontSize: "14px", fontWeight: 700,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "default" : "pointer",
            letterSpacing: "0.02em",
            transition: "opacity 0.15s, box-shadow 0.15s",
            boxShadow: loading ? "none" : "0 4px 20px rgba(184,152,90,0.25)",
          }}>
            {loading ? "Signing in..." : mode === "signup" ? "Create account & continue" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} style={{
                background: "none", border: "none", color: "var(--gold)",
                fontSize: "13px", fontWeight: 600, padding: 0, cursor: "pointer",
              }}>Sign in</button>
            </>
          ) : (
            <>
              No account yet?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} style={{
                background: "none", border: "none", color: "var(--gold)",
                fontSize: "13px", fontWeight: 600, padding: 0, cursor: "pointer",
              }}>Create one</button>
            </>
          )}
        </p>
      </div>

      {/* Demo note */}
      <p style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center", maxWidth: "320px", lineHeight: 1.6 }}>
        Demo — use any name, email, and password. No data is stored. Session resets when you close the tab.
      </p>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: "24px", display: "flex", alignItems: "center", gap: "6px" }}>
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
