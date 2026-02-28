'use client';

import { useEffect, useState } from 'react';

interface ContractData {
  clientName: string;
  clientEmail: string;
  service: { name: string; price: number; duration: number };
  staffMember: { name: string };
  dateStr: string;
  time: string;
  bookingRef: string;
}

const FALLBACK: ContractData = {
  clientName: 'Anders Nielsen',
  clientEmail: 'anders.nielsen@example.dk',
  service: { name: 'Classic Cut', price: 260, duration: 45 },
  staffMember: { name: 'Marcus Holst' },
  dateStr: new Date().toLocaleDateString('da-DK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  time: '10:00',
  bookingRef: 'NK-DEMO01',
};

function todayDanish() {
  return new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function KontraktPage() {
  const [data, setData] = useState<ContractData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('bf_pending_contract');
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        setData(FALLBACK);
      }
    } catch {
      setData(FALLBACK);
    }
  }, []);

  if (!data) return null;

  const today = todayDanish();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #F4F1EC;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #1A1A1A;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page-wrapper {
          min-height: 100vh;
          padding: 32px 16px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .action-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          width: 100%;
          max-width: 760px;
        }

        .btn-download {
          background: #B8985A;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 11px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.03em;
        }

        .btn-download:hover { background: #A5853E; }

        .btn-back {
          background: transparent;
          color: #1A1A1A;
          border: 1px solid #D0C9BE;
          border-radius: 6px;
          padding: 11px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-back:hover { background: #EDE9E2; }

        .contract {
          background: #FFFFFF;
          width: 100%;
          max-width: 760px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.12);
          border-radius: 2px;
        }

        /* Header band */
        .contract-header {
          background: #1A1107;
          color: #FFFFFF;
          padding: 36px 48px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-bottom: 3px solid #B8985A;
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .logo-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #FFFFFF;
        }

        .contract-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #B8985A;
          margin-bottom: 10px;
        }

        .contract-meta {
          font-size: 12px;
          color: #BBB;
          letter-spacing: 0.06em;
        }

        .contract-meta span {
          margin: 0 10px;
          color: #B8985A;
        }

        /* Body */
        .contract-body {
          padding: 0 48px 48px;
        }

        /* Section */
        .section {
          border-top: 1px solid #E0D9CE;
          padding-top: 24px;
          margin-top: 24px;
        }

        .section-heading {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 14px;
        }

        .section-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #B8985A;
          min-width: 26px;
        }

        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #1A1A1A;
        }

        .section-body {
          font-size: 13.5px;
          line-height: 1.7;
          color: #333;
          padding-left: 36px;
        }

        /* Party grid */
        .party-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-left: 36px;
        }

        .party-block label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #B8985A;
          margin-bottom: 5px;
        }

        .party-block p {
          font-size: 13.5px;
          line-height: 1.6;
          color: #333;
        }

        /* Service table */
        .service-table {
          width: 100%;
          border-collapse: collapse;
          margin-left: 36px;
          width: calc(100% - 36px);
          font-size: 13px;
        }

        .service-table th {
          background: #F7F4EE;
          text-align: left;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
          border: 1px solid #E0D9CE;
        }

        .service-table td {
          padding: 10px 12px;
          border: 1px solid #E0D9CE;
          color: #222;
          font-size: 13.5px;
          vertical-align: top;
        }

        .service-table tr:nth-child(even) td {
          background: #FAFAF7;
        }

        /* Signature section */
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          padding-left: 36px;
          margin-top: 6px;
        }

        .sig-box label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #B8985A;
          margin-bottom: 12px;
        }

        .sig-name {
          font-size: 13px;
          color: #333;
          margin-bottom: 36px;
        }

        .sig-line {
          border-bottom: 1px solid #333;
          margin-bottom: 6px;
          height: 1px;
        }

        .sig-line-label {
          font-size: 10px;
          color: #999;
          letter-spacing: 0.04em;
        }

        .sig-date-row {
          margin-top: 16px;
          font-size: 12px;
          color: #555;
        }

        /* Footer */
        .contract-footer {
          border-top: 1px solid #E0D9CE;
          margin-top: 32px;
          padding-top: 18px;
          text-align: center;
        }

        .footer-main {
          font-size: 12px;
          color: #555;
          letter-spacing: 0.03em;
          margin-bottom: 6px;
        }

        .footer-sub {
          font-size: 10.5px;
          color: #AAA;
          letter-spacing: 0.02em;
        }

        /* PRINT STYLES */
        @media print {
          body { background: #FFFFFF; }
          .action-bar { display: none !important; }
          .page-wrapper { padding: 0; background: #FFFFFF; }
          .contract {
            box-shadow: none;
            max-width: 100%;
            width: 100%;
            border-radius: 0;
          }
          .contract-header { padding: 28px 40px 24px; }
          .contract-body { padding: 0 40px 40px; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="action-bar">
          <button className="btn-back" onClick={() => window.history.back()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Tilbage til side
          </button>
          <button className="btn-download" onClick={() => window.print()}>
            Download PDF
          </button>
        </div>

        <div className="contract">
          {/* HEADER */}
          <div className="contract-header">
            <div className="logo-row">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="4" stroke="#B8985A" strokeWidth="1.8"/>
                <circle cx="8" cy="24" r="4" stroke="#B8985A" strokeWidth="1.8"/>
                <line x1="11.5" y1="8" x2="26" y2="22.5" stroke="#B8985A" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="11.5" y1="24" x2="26" y2="9.5" stroke="#B8985A" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="26" cy="16" r="1.5" fill="#B8985A"/>
              </svg>
              <span className="logo-name">Nordklip Barbershop</span>
            </div>
            <div className="contract-title">Serviceaftale</div>
            <div className="contract-meta">
              Kontrakt nr: <span>{data.bookingRef}</span>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Dato: <span>{today}</span>
            </div>
          </div>

          {/* BODY */}
          <div className="contract-body">

            {/* Section 1 — PARTER */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">1.</span>
                <span className="section-title">Parter</span>
              </div>
              <div className="party-grid">
                <div className="party-block">
                  <label>Tjenesteyder</label>
                  <p>
                    Nordklip Barbershop<br/>
                    Kongensgade 14<br/>
                    1264 København K<br/>
                    CVR: 38751294
                  </p>
                </div>
                <div className="party-block">
                  <label>Kunde</label>
                  <p>
                    {data.clientName}<br/>
                    {data.clientEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 — SERVICEDETALJER */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">2.</span>
                <span className="section-title">Servicedetaljer</span>
              </div>
              <table className="service-table">
                <thead>
                  <tr>
                    <th>Ydelse</th>
                    <th>Pris</th>
                    <th>Varighed</th>
                    <th>Barber</th>
                    <th>Dato</th>
                    <th>Tidspunkt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.service.name}</td>
                    <td>{data.service.price} kr.</td>
                    <td>{data.service.duration} min.</td>
                    <td>{data.staffMember.name}</td>
                    <td>{data.dateStr}</td>
                    <td>{data.time}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3 — BETALINGSBETINGELSER */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">3.</span>
                <span className="section-title">Betalingsbetingelser</span>
              </div>
              <div className="section-body">
                Betaling erlægges ved aftalens gennemførelse. Accepterede betalingsmetoder: Dankort, Visa, Mastercard og MobilePay.
                Enhver aftale er bindende fra det tidspunkt, bookingen er bekræftet.
              </div>
            </div>

            {/* Section 4 — AFBESTILLINGSPOLITIK */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">4.</span>
                <span className="section-title">Afbestillingspolitik</span>
              </div>
              <div className="section-body">
                Afbestilling skal ske senest 24 timer før den aftalte tid. Ved afbestilling kortere end 24 timer
                forbeholder Nordklip Barbershop sig retten til at opkræve et afbestillingsgebyr på 50% af
                ydelsens pris. Ved udeblivelse uden forudgående afmelding opkræves fuld pris.
              </div>
            </div>

            {/* Section 5 — ANSVAR */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">5.</span>
                <span className="section-title">Ansvar</span>
              </div>
              <div className="section-body">
                Nordklip Barbershop påtager sig intet ansvar for eventuelle skader forårsaget af allergiske
                reaktioner på anvendte produkter. Kunden er ansvarlig for at oplyse om kendte allergier
                eller hudproblemer inden behandlingen påbegyndes.
              </div>
            </div>

            {/* Section 6 — PERSONDATAPOLITIK */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">6.</span>
                <span className="section-title">Persondatapolitik</span>
              </div>
              <div className="section-body">
                Nordklip Barbershop behandler kundens persondata i overensstemmelse med GDPR.
                Data opbevares i maksimalt 2 år efter seneste booking og anvendes udelukkende til
                bookingadministration og kundekommunikation.
              </div>
            </div>

            {/* Section 7 — SIGNATUR */}
            <div className="section">
              <div className="section-heading">
                <span className="section-num">7.</span>
                <span className="section-title">Signatur</span>
              </div>
              <div className="signature-grid">
                <div className="sig-box">
                  <label>Tjenesteyder</label>
                  <div className="sig-name">Nordklip Barbershop</div>
                  <div className="sig-line"/>
                  <div className="sig-line-label">Underskrift</div>
                  <div className="sig-date-row">Dato: {today}</div>
                </div>
                <div className="sig-box">
                  <label>Kunde</label>
                  <div className="sig-name">{data.clientName}</div>
                  <div className="sig-line"/>
                  <div className="sig-line-label">Underskrift</div>
                  <div className="sig-date-row">Dato: _______________________</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="contract-footer">
              <div className="footer-main">
                Nordklip Barbershop &middot; Kongensgade 14 &middot; 1264 København K &middot; +45 33 12 34 56 &middot; info@nordklip.dk &middot; CVR: 38751294
              </div>
              <div className="footer-sub">
                Denne kontrakt er automatisk genereret via BookFlow booking system
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
