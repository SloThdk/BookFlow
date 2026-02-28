'use client';

import { useEffect, useState } from 'react';

interface EmployeeContract {
  employeeName: string;
  role: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  startDate: string;
  contractType: string;
  hoursPerWeek: number;
  schedule: Record<string, string>;
  bankAccount: string;
  specialties: string[];
}

function todayDanish() {
  return new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EmployeeContractPage() {
  const [data, setData] = useState<EmployeeContract | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('bf_employee_contract');
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Ingen kontraktdata fundet</h1>
      <p style={{ color: '#666' }}>Gaa til medarbejdersiden og klik "Download kontrakt".</p>
    </div>
  );

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
        .page-wrapper { min-height: 100vh; padding: 32px 16px 60px; display: flex; flex-direction: column; align-items: center; }
        .action-bar { display: flex; gap: 12px; margin-bottom: 28px; width: 100%; max-width: 760px; }
        .btn-download { background: #B8985A; color: #fff; border: none; border-radius: 6px; padding: 11px 24px; font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: 0.03em; }
        .btn-download:hover { background: #A5853E; }
        .contract { background: #FFFFFF; width: 100%; max-width: 760px; box-shadow: 0 4px 32px rgba(0,0,0,0.12); border-radius: 2px; }
        .contract-header { background: #1A1107; color: #FFFFFF; padding: 36px 48px 30px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 3px solid #B8985A; }
        .logo-name { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 0.04em; color: #FFFFFF; }
        .contract-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #B8985A; margin-top: 16px; margin-bottom: 10px; }
        .contract-meta { font-size: 12px; color: #BBB; letter-spacing: 0.06em; }
        .contract-meta span { margin: 0 10px; color: #B8985A; }
        .contract-body { padding: 0 48px 48px; }
        .section { border-top: 1px solid #E0D9CE; padding-top: 24px; margin-top: 24px; }
        .section-heading { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
        .section-num { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: #B8985A; min-width: 26px; }
        .section-title { font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #1A1A1A; }
        .section-body { font-size: 13.5px; line-height: 1.7; color: #333; padding-left: 36px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-left: 36px; }
        .info-item label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8985A; margin-bottom: 4px; }
        .info-item p { font-size: 13.5px; line-height: 1.5; color: #333; }
        .schedule-table { width: calc(100% - 36px); margin-left: 36px; border-collapse: collapse; font-size: 13px; }
        .schedule-table th { background: #F7F4EE; text-align: left; padding: 8px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; border: 1px solid #E0D9CE; }
        .schedule-table td { padding: 10px 12px; border: 1px solid #E0D9CE; color: #222; font-size: 13.5px; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding-left: 36px; margin-top: 6px; }
        .sig-box label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8985A; margin-bottom: 12px; }
        .sig-name { font-size: 13px; color: #333; margin-bottom: 36px; }
        .sig-line { border-bottom: 1px solid #333; margin-bottom: 6px; height: 1px; }
        .sig-line-label { font-size: 10px; color: #999; letter-spacing: 0.04em; }
        .sig-date-row { margin-top: 16px; font-size: 12px; color: #555; }
        .contract-footer { border-top: 1px solid #E0D9CE; margin-top: 32px; padding-top: 18px; text-align: center; }
        .footer-main { font-size: 12px; color: #555; letter-spacing: 0.03em; margin-bottom: 6px; }
        .footer-sub { font-size: 10.5px; color: #AAA; letter-spacing: 0.02em; }
        @media print {
          body { background: #FFFFFF; }
          .action-bar { display: none !important; }
          .page-wrapper { padding: 0; background: #FFFFFF; }
          .contract { box-shadow: none; max-width: 100%; width: 100%; border-radius: 0; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="action-bar">
          <button className="btn-download" onClick={() => window.print()}>Download PDF</button>
        </div>

        <div className="contract">
          <div className="contract-header">
            <span className="logo-name">Nordklip Barbershop</span>
            <div className="contract-title">Ansættelseskontrakt</div>
            <div className="contract-meta">
              Udstedt: <span>{today}</span>
            </div>
          </div>

          <div className="contract-body">
            <div className="section">
              <div className="section-heading">
                <span className="section-num">1.</span>
                <span className="section-title">Parter</span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Arbejdsgiver</label>
                  <p>Nordklip Barber ApS<br/>Kongensgade 14<br/>1264 Koebenhavn K<br/>CVR: 38751294</p>
                </div>
                <div className="info-item">
                  <label>Medarbejder</label>
                  <p>{data.employeeName}<br/>{data.address}<br/>Tlf: {data.phone}<br/>E-mail: {data.email}</p>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">2.</span>
                <span className="section-title">Personoplysninger</span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Fulde navn</label>
                  <p>{data.employeeName}</p>
                </div>
                <div className="info-item">
                  <label>Foedselsdato</label>
                  <p>{data.birthDate}</p>
                </div>
                <div className="info-item">
                  <label>Stilling</label>
                  <p>{data.role}</p>
                </div>
                <div className="info-item">
                  <label>Ansættelsestype</label>
                  <p>{data.contractType}</p>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">3.</span>
                <span className="section-title">Ansættelsesforhold</span>
              </div>
              <div className="section-body">
                <p style={{ marginBottom: '8px' }}>Tiltraedelsesdato: <strong>{data.startDate}</strong></p>
                <p style={{ marginBottom: '8px' }}>Ugentlige timer: <strong>{data.hoursPerWeek} timer</strong></p>
                <p>Loen udbetales den 1. i hver maaned til bankkonto: <strong>{data.bankAccount}</strong></p>
              </div>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">4.</span>
                <span className="section-title">Arbejdstider</span>
              </div>
              <table className="schedule-table">
                <thead>
                  <tr><th>Dag</th><th>Timer</th></tr>
                </thead>
                <tbody>
                  {Object.entries(data.schedule).map(([day, hrs]) => (
                    <tr key={day}><td>{day}</td><td>{hrs}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">5.</span>
                <span className="section-title">Saerlige kompetencer</span>
              </div>
              <div className="section-body">
                {data.specialties.join(', ')}
              </div>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">6.</span>
                <span className="section-title">Vilkaar</span>
              </div>
              <div className="section-body">
                <p style={{ marginBottom: '8px' }}>Ferie afholdes i henhold til ferieloven. Opsigelsesvarsel: 1 maaned (provetid 3 mdr.).</p>
                <p>Overenskomst: Frisoerfagets Overenskomst 2024.</p>
              </div>
            </div>

            <div className="section">
              <div className="section-heading">
                <span className="section-num">7.</span>
                <span className="section-title">Underskrifter</span>
              </div>
              <div className="signature-grid">
                <div className="sig-box">
                  <label>Arbejdsgiver</label>
                  <div className="sig-name">Nordklip Barber ApS</div>
                  <div className="sig-line"/>
                  <div className="sig-line-label">Underskrift</div>
                  <div className="sig-date-row">Dato: {today}</div>
                </div>
                <div className="sig-box">
                  <label>Medarbejder</label>
                  <div className="sig-name">{data.employeeName}</div>
                  <div className="sig-line"/>
                  <div className="sig-line-label">Underskrift</div>
                  <div className="sig-date-row">Dato: _______________________</div>
                </div>
              </div>
            </div>

            <div className="contract-footer">
              <div className="footer-main">
                Nordklip Barbershop &middot; Kongensgade 14 &middot; 1264 Koebenhavn K &middot; +45 33 12 34 56 &middot; info@nordklip.dk &middot; CVR: 38751294
              </div>
              <div className="footer-sub">
                Denne kontrakt er automatisk genereret via BookFlow &middot; Drevet af Sloth Studio
              </div>
              <div className="footer-sub" style={{ marginTop: '4px' }}>
                NOTE: Simulerede data — faktiske oplysninger vises i produktion.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
