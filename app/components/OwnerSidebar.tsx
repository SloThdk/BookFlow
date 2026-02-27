"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface OwnerSidebarProps {
  onLogout: () => void;
}

export function OwnerSidebar({ onLogout }: OwnerSidebarProps) {
  const pathname = usePathname();

  const nav = [
    {
      label: "Oversigt",
      href: "/owner",
      active: pathname === "/owner",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      ),
    },
    {
      label: "Holdplan",
      href: "/admin",
      active: pathname === "/admin",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 6h14M5 2v4M11 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Kunder",
      href: "/kunder",
      active: pathname === "/kunder",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M11 7.5c1.1.4 2 1.5 2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M13 5a2 2 0 0 1 0 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Medarbejdere",
      href: "/medarbejdere",
      active: pathname === "/medarbejdere",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 7h5M4 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M12 5l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .owner-sidebar { width: 100% !important; min-height: unset !important; height: auto !important; position: relative !important; flex-direction: row !important; border-right: none !important; border-bottom: 1px solid var(--border) !important; overflow-x: auto !important; flex-shrink: 0 !important; }
        .owner-sidebar .sidebar-logo { display: none !important; }
        .owner-sidebar .sidebar-bottom { display: none !important; }
        .owner-sidebar .sidebar-nav { flex-direction: row !important; padding: 0 !important; gap: 0 !important; overflow-x: auto !important; }
        .owner-sidebar .sidebar-nav > div { display: none !important; }
        .owner-sidebar .sidebar-nav a { flex-direction: column !important; gap: 3px !important; padding: 10px 14px !important; border-radius: 0 !important; font-size: 10px !important; white-space: nowrap !important; box-shadow: none !important; border: none !important; border-bottom: 2px solid transparent !important; }
        .owner-sidebar .sidebar-nav a[data-active="true"] { border-bottom: 2px solid var(--gold) !important; background: transparent !important; }
        .sidebar-wrapper { flex-direction: column !important; }
      }
    `}</style>
    <aside className="owner-sidebar" style={{
      width: "220px",
      flexShrink: 0,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: "28px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <a href="https://nordklip.pages.dev" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>Nordklip</span>
        </a>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          marginTop: "6px",
          background: "rgba(184,152,90,0.08)", border: "1px solid var(--gold-border)",
          borderRadius: "4px", padding: "3px 8px",
        }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="5" width="10" height="6.5" rx="1.5" stroke="var(--gold)" strokeWidth="1.2"/>
            <path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>Ejersystem</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--text-muted)",
          padding: "0 8px", marginBottom: "8px",
        }}>
          Navigation
        </div>
        {nav.map(item => (
          <Link key={item.label} href={item.href} data-active={item.active ? "true" : "false"} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "7px", textDecoration: "none",
            background: item.active ? "rgba(184,152,90,0.13)" : "transparent",
            border: item.active ? "1px solid rgba(184,152,90,0.28)" : "1px solid transparent",
            boxShadow: item.active ? "inset 3px 0 0 var(--gold)" : "none",
            color: item.active ? "var(--gold)" : "var(--text-secondary)",
            fontSize: "14px", fontWeight: item.active ? 700 : 500,
            transition: "all 0.15s",
          }}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom" style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="3" stroke="var(--gold)" strokeWidth="1.3"/>
              <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>Ejer</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>owner@nordklip.dk</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", background: "transparent",
          border: "1px solid var(--border-strong)", borderRadius: "7px",
          color: "var(--text-muted)", fontSize: "12px", fontWeight: 500,
          padding: "8px 12px", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5 7h8M10 4.5L12.5 7 10 9.5M5.5 3H2V11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Log ud
        </button>
      </div>
    </aside>
    </>
  );
}
