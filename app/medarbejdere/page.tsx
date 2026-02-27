"use client";

import { useState, useEffect } from "react";
import { OwnerSidebar } from "../components/OwnerSidebar";
import Link from "next/link";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Employee {
  id: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  startDate: string;
  contractType: string;
  hoursPerWeek: number;
  schedule: Record<string, string>;
  specialties: string[];
  monthlyStats: { bookings: number; revenue: number; fill: number; change: number };
  bankAccount: string;
  cprLast4: string;
  emergencyName: string;
  emergencyPhone: string;
  notes: string;
  color: string;
}

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EMPLOYEES: Employee[] = [
  {
    id: "marcus",
    name: "Marcus Holst",
    role: "Senior Barber",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face",
    phone: "+45 22 87 43 11",
    email: "marcus@nordklip.dk",
    address: "NÃ¸rrebrogade 145, 2. th., 2200 KÃ¸benhavn N",
    birthDate: "22. juni 1990",
    startDate: "15. marts 2018",
    contractType: "Fast fuldtid",
    hoursPerWeek: 37,
    schedule: {
      "Man": "09:00â€“17:30",
      "Tir": "09:00â€“17:30",
      "Ons": "09:00â€“17:30",
      "Tor": "09:00â€“17:30",
      "Fre": "09:00â€“17:30",
      "LÃ¸r": "10:00â€“15:00",
      "SÃ¸n": "Fri",
    },
    specialties: ["Klassisk herreklip", "Hot Towel Shave", "SkÃ¦gtrimning", "Fade & taper"],
    monthlyStats: { bookings: 38, revenue: 10140, fill: 92, change: 4 },
    bankAccount: "5301-1234567",
    cprLast4: "xxxx",
    emergencyName: "Helle Holst (sÃ¸ster)",
    emergencyPhone: "+45 26 44 33 22",
    notes: "8 Ã¥rs erfaring. ForetrÃ¦kker prÃ¦cisionsklip med saks. HÃ¸jre-hÃ¥ndet. Taler dansk og engelsk.",
    color: "#B8985A",
  },
  {
    id: "emil",
    name: "Emil Strand",
    role: "Barber",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face",
    phone: "+45 31 55 78 44",
    email: "emil@nordklip.dk",
    address: "Istedgade 78, 1. tv., 1650 KÃ¸benhavn V",
    birthDate: "4. november 1995",
    startDate: "2. september 2021",
    contractType: "Fast fuldtid",
    hoursPerWeek: 37,
    schedule: {
      "Man": "09:00â€“17:30",
      "Tir": "09:00â€“17:30",
      "Ons": "11:00â€“19:30",
      "Tor": "11:00â€“19:30",
      "Fre": "09:00â€“17:30",
      "LÃ¸r": "10:00â€“15:00",
      "SÃ¸n": "Fri",
    },
    specialties: ["Herreklip", "SkÃ¦g", "BlÃ¸d fade", "Junior klip"],
    monthlyStats: { bookings: 31, revenue: 7890, fill: 84, change: -2 },
    bankAccount: "1551-7654321",
    cprLast4: "xxxx",
    emergencyName: "Lotte Strand (kÃ¦reste)",
    emergencyPhone: "+45 40 22 99 55",
    notes: "4 Ã¥rs erfaring. God med nervÃ¸se kunder og bÃ¸rn. Taler dansk, engelsk og lidt tysk.",
    color: "#7BA3C4",
  },
  {
    id: "sofia",
    name: "Sofia Krag",
    role: "Barber & Farvespecialist",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=face",
    phone: "+45 53 66 11 88",
    email: "sofia@nordklip.dk",
    address: "Griffenfeldsgade 12, st., 2200 KÃ¸benhavn N",
    birthDate: "17. marts 1993",
    startDate: "10. januar 2020",
    contractType: "Fast fuldtid",
    hoursPerWeek: 37,
    schedule: {
      "Man": "10:00â€“18:30",
      "Tir": "10:00â€“18:30",
      "Ons": "10:00â€“18:30",
      "Tor": "10:00â€“18:30",
      "Fre": "10:00â€“18:30",
      "LÃ¸r": "10:00â€“16:00",
      "SÃ¸n": "Fri",
    },
    specialties: ["Farve & highlights", "Balayage", "SkÃ¦g", "Klassisk klip", "HÃ¥rbehandling"],
    monthlyStats: { bookings: 22, revenue: 12100, fill: 96, change: 8 },
    bankAccount: "0793-9988776",
    cprLast4: "xxxx",
    emergencyName: "Thomas Krag (bror)",
    emergencyPhone: "+45 27 33 44 99",
    notes: "5 Ã¥rs erfaring. Certificeret farvespecialist (Wella Pro, 2021). Eneste medarbejder godkendt til farvning. Taler dansk, svensk og engelsk.",
    color: "#C49BBF",
  },
];

function fmtDKK(n: number) { return n.toLocaleString("da-DK") + " kr."; }

function downloadContract(emp: Employee) {
  const lines = [
    "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•",
    "             ANSÃ†TTELSESKONTRAKT",
    "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•",
    "",
    "Arbejdsgiver:",
    "  Nordklip Barber ApS",
    "  CVR: 38 47 21 09",
    "  BlÃ¥gÃ¥rdsgade 17, st.",
    "  2200 KÃ¸benhavn N",
    "  Tlf: +45 32 15 67 89",
    "",
    "Medarbejder:",
    `  Fulde navn:     ${emp.name}`,
    `  Stilling:       ${emp.role}`,
    `  FÃ¸dselsdato:    ${emp.birthDate}`,
    `  Adresse:        ${emp.address}`,
    `  Telefon:        ${emp.phone}`,
    `  E-mail:         ${emp.email}`,
    "",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "AnsÃ¦ttelsesforhold",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "",
    `  Startdato:           ${emp.startDate}`,
    `  AnsÃ¦ttelsestype:     ${emp.contractType}`,
    `  Ugentlige timer:     ${emp.hoursPerWeek} timer`,
    "",
    "Arbejdstider:",
    ...Object.entries(emp.schedule).map(([day, hrs]) => `  ${day.padEnd(6)}  ${hrs}`),
    "",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "LÃ¸n og vilkÃ¥r",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "",
    "  LÃ¸n udbetales den 1. i hver mÃ¥ned til",
    `  bankkonto: ${emp.bankAccount}`,
    "",
    "  Ferie: Afholdes i henhold til ferieloven.",
    "  Opsigelsesvarsel: 1 mÃ¥ned (prÃ¸vetid 3 mdr.)",
    "  Overenskomst: FrisÃ¸rfagets Overenskomst 2024",
    "",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "SÃ¦rlige kompetencer",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "",
    `  ${emp.specialties.join(", ")}`,
    "",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "Underskrifter",
    "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
    "",
    "  Arbejdsgiver:                 Medarbejder:",
    "",
    "",
    "  _______________________       _______________________",
    "  Nordklip Barber ApS           " + emp.name,
    `  Dato: _______________          Dato: _______________`,
    "",
    "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•",
    "  Dokument genereret: " + new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }),
    "  BookFlow â€” Drevet af Sloth Studio",
    "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•",
    "  NOTE: Simulerede data â€“ faktiske oplysninger",
    "  vises i produktion.",
    "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•",
  ];
  const text = lines.join("\n");
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
  a.download = `kontrakt-${emp.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}
function yearsFrom(dateStr: string) {
  // "22. juni 1990" â†’ parts: ["22.", "juni", "1990"]
  const parts = dateStr.trim().split(/\s+/);
  const months: Record<string, number> = { januar: 0, februar: 1, marts: 2, april: 3, maj: 4, juni: 5, juli: 6, august: 7, september: 8, oktober: 9, november: 10, december: 11 };
  const day   = parseInt(parts[0]);
  const month = months[(parts[1] ?? "").toLowerCase()] ?? 0;
  const year  = parseInt(parts[2] ?? "0");
  if (isNaN(day) || isNaN(year)) return 0;
  const start = new Date(year, month, day);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

// â”€â”€â”€ Employee Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmployeeCard({ emp }: { emp: Employee }) {
  const [tab, setTab] = useState<"info" | "stats" | "schema">("info");
  const yearsEmployed = yearsFrom(emp.startDate);
  const age = yearsFrom(emp.birthDate);

  const tabs: { key: "info" | "stats" | "schema"; label: string }[] = [
    { key: "info",   label: "Kontakt & ansÃ¦ttelse" },
    { key: "stats",  label: "Denne mÃ¥ned" },
    { key: "schema", label: "Arbejdstider" },
  ];

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border-strong)",
      borderRadius: "12px", overflow: "hidden",
    }}>
      {/* Top strip with accent color */}
      <div style={{ height: "3px", background: emp.color }}/>

      {/* Header */}
      <div style={{ padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: "18px" }}>
        <img src={emp.photo} alt={emp.name} style={{
          width: "64px", height: "64px", borderRadius: "50%",
          objectFit: "cover", border: "2px solid var(--border-strong)", flexShrink: 0,
        }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>{emp.name}</div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: emp.color, marginBottom: "8px" }}>{emp.role}</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {emp.specialties.map(s => (
              <span key={s} style={{
                fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-strong)",
                color: "var(--text-muted)",
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Right column: years badge + download */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{
            textAlign: "center",
            background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
            borderRadius: "8px", padding: "8px 14px",
          }}>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{age}</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "3px" }}>Alder</div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "4px" }}>{yearsEmployed} Ã¥r ansat</div>
          </div>
          <button onClick={() => downloadContract(emp)} style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "var(--surface-2)", border: "1px solid var(--border-strong)",
            borderRadius: "6px", padding: "6px 11px", cursor: "pointer",
            fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)",
            transition: "all 0.12s", whiteSpace: "nowrap",
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Download kontrakt
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px 8px", fontSize: "11px", fontWeight: tab === t.key ? 700 : 400,
            color: tab === t.key ? "var(--text)" : "var(--text-muted)",
            background: "transparent", border: "none",
            borderBottom: tab === t.key ? `2px solid ${emp.color}` : "2px solid transparent",
            cursor: "pointer", transition: "all 0.12s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px 24px" }}>

        {tab === "info" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
            {[
              { label: "Telefon",         value: emp.phone },
              { label: "Email",           value: emp.email },
              { label: "Adresse",         value: emp.address },
              { label: "FÃ¸dselsdato",     value: `${emp.birthDate} (${yearsFrom(emp.birthDate)} Ã¥r)` },
              { label: "Ansat siden",     value: emp.startDate },
              { label: "AnsÃ¦ttelsestype", value: emp.contractType },
              { label: "Timer/uge",       value: `${emp.hoursPerWeek} timer` },
              { label: "Bankkonto",       value: emp.bankAccount },
              { label: "NÃ¸dkontakt",      value: `${emp.emergencyName}` },
              { label: "NÃ¸dkontakt tlf.", value: emp.emergencyPhone },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", gridColumn: label === "Adresse" || label === "NÃ¸dkontakt" ? "1 / -1" : "auto" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            {emp.notes && (
              <div style={{ padding: "12px 0", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>Notater</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>{emp.notes}</div>
              </div>
            )}
          </div>
        )}

        {tab === "stats" && (
          <div>
            {/* Big KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Aftaler",    value: `${emp.monthlyStats.bookings}`, sub: "denne mÃ¥ned" },
                { label: "OmsÃ¦tning", value: fmtDKK(emp.monthlyStats.revenue), sub: "denne mÃ¥ned" },
                { label: "BelÃ¦gning", value: `${emp.monthlyStats.fill}%`, sub: "kapacitet brugt" },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", fontWeight: 700, color: "var(--gold)", lineHeight: 1, marginBottom: "4px" }}>{value}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Fill bar */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>KapacitetsbelÃ¦gning</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: emp.monthlyStats.fill >= 90 ? "#4ade80" : "var(--gold)" }}>{emp.monthlyStats.fill}%</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    color: emp.monthlyStats.change >= 0 ? "#4ade80" : "#f87171",
                    background: emp.monthlyStats.change >= 0 ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                    border: `1px solid ${emp.monthlyStats.change >= 0 ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                    borderRadius: "4px", padding: "1px 6px",
                  }}>
                    {emp.monthlyStats.change >= 0 ? "â†‘" : "â†“"} {Math.abs(emp.monthlyStats.change)}%
                  </span>
                </div>
              </div>
              <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${emp.monthlyStats.fill}%`, borderRadius: "4px",
                  background: emp.monthlyStats.fill >= 90
                    ? "linear-gradient(90deg, #4ade80, #22c55e)"
                    : `linear-gradient(90deg, ${emp.color}, ${emp.color}80)`,
                  transition: "width 0.4s ease",
                }}/>
              </div>
            </div>

            {/* Ydelse breakdown */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "8px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Ydelsesfordeling</div>
              {emp.specialties.slice(0, 4).map((s, i) => {
                const pct = Math.max(20, 90 - i * 18);
                return (
                  <div key={s} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{pct}%</span>
                    </div>
                    <div style={{ height: "3px", background: "var(--surface)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: emp.color, borderRadius: "2px", opacity: 0.7 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "schema" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
              {Object.entries(emp.schedule).map(([day, hours]) => {
                const isFri = hours === "Fri";
                return (
                  <div key={day} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: "7px",
                    background: isFri ? "transparent" : "var(--surface-2)",
                    border: `1px solid ${isFri ? "transparent" : "var(--border-strong)"}`,
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: isFri ? "var(--text-muted)" : "var(--text-secondary)", minWidth: "36px" }}>{day}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {!isFri && (
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: emp.color }}/>
                      )}
                      <span style={{ fontSize: "12px", fontWeight: isFri ? 400 : 600, color: isFri ? "var(--text-muted)" : "var(--text)" }}>{hours}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
              borderRadius: "8px", padding: "10px 14px",
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--gold)", flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ fontWeight: 700, color: "var(--gold)" }}>{emp.hoursPerWeek} timer/uge</span> Â· {emp.contractType}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Auth Gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AuthGate({ onAuth }: { onAuth: () => void }) {
  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner")) { onAuth(); } } catch {}
  }, [onAuth]);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", color: "var(--gold)", marginBottom: "12px" }}>Nordklip</div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Log ind som ejer for at se medarbejdere.</p>
        <Link href="/owner" style={{ display: "inline-block", background: "var(--gold)", color: "#0E0C09", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>GÃ¥ til ejeroversigt</Link>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MedarbejderePage() {
  const [authed, setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try { if (sessionStorage.getItem("bf_owner")) setAuthed(true); } catch {}
    setChecking(false);
  }, []);

  function handleLogout() {
    try { sessionStorage.removeItem("bf_owner"); } catch {}
    window.location.href = "/owner";
  }

  if (checking) return null;
  if (!authed) return <AuthGate onAuth={() => setAuthed(true)}/>;

  return (
    <div className="sidebar-wrapper" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <OwnerSidebar onLogout={handleLogout}/>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(14,12,9,0.92)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          padding: "24px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Medarbejdere</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{EMPLOYEES.length} ansatte Â· Nordklip Barber</p>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "6px", padding: "5px 12px" }}>
            {EMPLOYEES.length} medarbejdere
          </div>
        </div>

        <main style={{ padding: "24px 32px 80px", flex: 1 }}>
          {/* Production note */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px",
            background: "rgba(184,152,90,0.06)", border: "1px solid var(--gold-border)",
            borderRadius: "9px", padding: "12px 16px",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px", color: "var(--gold)" }}>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5.5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>I produktion</span> kan du redigere, tilfÃ¸je og slette al medarbejderinformation direkte â€” navn, kontakt, arbejdstider, bankkonto og mere. Alt gemmes automatisk.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "16px" }}>
            {EMPLOYEES.map(emp => (
              <EmployeeCard key={emp.id} emp={emp}/>
            ))}
          </div>
        </main>

        <div style={{ paddingBottom: "36px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Drevet af</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>BookFlow</span>
          <span style={{ fontSize: "10px", color: "var(--border-strong)" }}>Â·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}>Bygget af Sloth Studio</a>
        </div>
      </div>
    </div>
  );
}

