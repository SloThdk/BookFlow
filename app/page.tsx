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
      if (typeof window !== "undefined" && sessionStorage.getItem("bf_session")) {
        router.replace("/book");
      }
    } catch {}
  }, [router]);

  function validate() {
    if (mode === "signup" && !name.trim()) return "Please enter your name.";
    if (!email.trim() || !email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);

    // Simulate a brief auth delay (makes it feel real)
    setTimeout(() => {
      const session = {
        name: mode === "signup" ? name.trim() : email.split("@")[0],
        email: email.trim(),
        createdAt: Date.now(),
      };
      try {
        sessionStorage.setItem("bf_session", JSON.stringify(session));
      } catch {}
      router.push("/book");
    }, 600);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-logo">Book<span>Flow</span></div>
        <ul className="topbar-links">
          <li>
            <Link href="/how-it-works">How it works</Link>
          </li>
          <li>
            <button
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
              style={{
                background: "transparent",
                border: "1px solid var(--border-strong)",
                color: "var(--text-secondary)",
                borderRadius: "6px",
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </li>
        </ul>
      </header>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left panel — product pitch */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "16px",
          }}>
            Interactive Demo
          </div>

          <h1 style={{
            fontSize: "38px",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            marginBottom: "20px",
          }}>
            Online booking,<br />
            built for your business.
          </h1>

          <p style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "420px",
            marginBottom: "40px",
          }}>
            Walk through a real booking flow — the same system your customers would use.
            Takes 90 seconds to complete a full booking.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "380px" }}>
            {[
              { title: "5-step booking flow", desc: "Service, staff, date, time, and contact details" },
              { title: "Live slot availability", desc: "Taken slots are crossed out automatically" },
              { title: "Instant confirmation", desc: "Booking summary + upcoming appointments view" },
              { title: "Simulated auth", desc: "Your session clears when you close the tab — no data stored" },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginTop: "7px",
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}>
            Built by{" "}
            <a
              href="https://sloth-studio.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-secondary)", fontWeight: 600 }}
            >
              Sloth Studio
            </a>
            {" "}&mdash; custom software for local businesses
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{
          width: "460px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}>
          <div style={{ width: "100%", maxWidth: "340px" }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}>
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h2>
            <p style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginBottom: "28px",
              lineHeight: 1.5,
            }}>
              {mode === "signup"
                ? "Use any name, email, and password — this is a demo."
                : "Enter the credentials you signed up with."}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mode === "signup" && (
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginBottom: "7px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    Your name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Holst"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "7px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "7px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>

              {error && (
                <p style={{ fontSize: "13px", color: "var(--red)", lineHeight: 1.5 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  color: "#0A0A0E",
                  borderRadius: "8px",
                  padding: "13px",
                  fontSize: "15px",
                  fontWeight: 700,
                  marginTop: "4px",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "default" : "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                {loading
                  ? "Signing in..."
                  : mode === "signup"
                  ? "Create account & continue"
                  : "Sign in"}
              </button>
            </form>

            <p style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-muted)",
            }}>
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("login"); setError(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: "13px",
                      fontWeight: 600,
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  No account yet?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: "13px",
                      fontWeight: 600,
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Create one
                  </button>
                </>
              )}
            </p>

            <div style={{
              marginTop: "24px",
              padding: "12px 16px",
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "8px",
            }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo mode: </span>
                No data is stored anywhere. Your session resets every time you close or refresh the tab.
              </p>
            </div>

            <p style={{ marginTop: "20px", textAlign: "center" }}>
              <Link
                href="/how-it-works"
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                How does this work?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
