"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HowItWorksPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    try {
      setLoggedIn(!!sessionStorage.getItem("bf_session"));
    } catch {}
  }, []);

  const steps = [
    {
      n: 1,
      title: "Create an account",
      desc: "Click \"Get started\" and enter any name, email, and password. No real sign-up — everything is simulated. Your session lives only in your browser tab and clears the moment you close it.",
    },
    {
      n: 2,
      title: "Pick a service",
      desc: "Choose from Classic Cut, Beard Sculpt, Cut & Beard, or Hot Towel Shave. Each shows the duration and price. This mirrors exactly how a real booking page would work for your customers.",
    },
    {
      n: 3,
      title: "Select a barber",
      desc: "Choose Oliver Berg, Marcus Lund, Emil Dahl, or \"No preference.\" In a real system this would pull availability per barber in real-time.",
    },
    {
      n: 4,
      title: "Choose a date",
      desc: "A date grid shows the next two weeks, with Sundays blocked out. Tap any available date to select it.",
    },
    {
      n: 5,
      title: "Pick a time slot",
      desc: "A grid of half-hour slots appears. Some are crossed out and unavailable — simulating real bookings already in the calendar. Pick any open slot.",
    },
    {
      n: 6,
      title: "Enter your details",
      desc: "Fill in your name and optional phone. A booking summary shows everything before you confirm. When you click \"Confirm booking\" you see a confirmation screen with your booking + a live list of upcoming appointments.",
    },
  ];

  const features = [
    { title: "No data stored", desc: "Session is browser-only. Closes with the tab." },
    { title: "Simulated availability", desc: "Real taken/available slot logic on every date." },
    { title: "Confirmation + appointments view", desc: "See your booking alongside upcoming ones." },
    { title: "Mobile-friendly", desc: "Works on any screen size." },
    { title: "Production-ready stack", desc: "Next.js, TypeScript — the real thing, not a mockup." },
    { title: "Custom for your brand", desc: "Colors, services, staff, and copy all configurable." },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <header className="topbar">
        <Link href="/" className="topbar-logo">Book<span style={{ color: "var(--accent)" }}>Flow</span></Link>
        <ul className="topbar-links">
          <li>
            <Link href={loggedIn ? "/book" : "/"}>
              {loggedIn ? "Back to booking" : "Get started"}
            </Link>
          </li>
          {loggedIn && (
            <li>
              <button
                onClick={() => {
                  try { sessionStorage.clear(); } catch {}
                  window.location.href = "/";
                }}
                style={{
                  background: "transparent", border: "1px solid var(--border-strong)",
                  color: "var(--text-secondary)", borderRadius: "6px",
                  padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </li>
          )}
        </ul>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px",
          }}>
            Documentation
          </div>
          <h1 style={{
            fontSize: "36px", fontWeight: 800, letterSpacing: "-0.03em",
            lineHeight: 1.15, marginBottom: "16px",
          }}>
            How BookFlow works
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "560px" }}>
            This is a live demo of a booking system built for Nordklip — a fictional barbershop.
            Walk through it yourself and see exactly what your customers would experience.
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "24px" }}>
            The booking flow
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: "20px" }}>
                {/* Left: number + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "var(--accent-dim)", border: "2px solid var(--accent-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "var(--accent)",
                    flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: "1px", flex: 1, background: "var(--border-strong)", margin: "6px 0" }} />
                  )}
                </div>
                {/* Right: content */}
                <div style={{ paddingBottom: i < steps.length - 1 ? "28px" : 0, paddingTop: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "24px" }}>
            What&apos;s included in the demo
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: "var(--surface)", border: "1px solid var(--border-strong)",
                borderRadius: "8px", padding: "16px 18px",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "5px" }}>
                  {f.title}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "24px" }}>
            Common questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0", border: "1px solid var(--border-strong)", borderRadius: "8px", overflow: "hidden" }}>
            {[
              { q: "Is my email or data stored anywhere?", a: "No. Everything runs in your browser's sessionStorage, which clears the moment you close or refresh the tab. Nothing is saved to a server." },
              { q: "Can I get this for my business?", a: "Yes — this is exactly what we build for clients. BookFlow is our own custom booking system, not a plugin or third-party widget. We build you a version branded to match your website, with your services, team, and availability. Comes with real bookings, email confirmations, and a business dashboard. Get in touch at sloth-studio.pages.dev." },
              { q: "What happens after the demo?", a: "It resets. Close the tab, come back, and it's fresh. You can complete the booking flow as many times as you like." },
              { q: "Does this work on mobile?", a: "Yes — fully responsive. The booking flow works on phones and tablets." },
            ].map((item, i, arr) => (
              <div key={i} style={{
                padding: "18px 20px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "7px" }}>
                  {item.q}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderRadius: "10px", padding: "36px", textAlign: "center",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px",
          }}>
            Want this for your business?
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
            We built this. We can build yours.
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "28px", maxWidth: "420px", margin: "0 auto 28px", lineHeight: 1.7 }}>
            BookFlow is our own custom booking system — not a plugin, not Calendly.
            Your business, your brand, your rules. Built from scratch and styled to match your website.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://sloth-studio.pages.dev"
              target="_blank" rel="noopener noreferrer"
              style={{
                background: "var(--accent)", color: "#0A0A0E",
                borderRadius: "8px", padding: "13px 32px",
                fontSize: "15px", fontWeight: 700, display: "inline-block",
              }}
            >
              Get a quote
            </a>
            <Link
              href={loggedIn ? "/book" : "/"}
              style={{
                background: "transparent", border: "1px solid var(--border-strong)",
                color: "var(--text)", borderRadius: "8px", padding: "13px 28px",
                fontSize: "15px", fontWeight: 600, display: "inline-block",
              }}
            >
              {loggedIn ? "Try the demo" : "Try the demo"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
