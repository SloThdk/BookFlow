const fs = require('fs');
const file = __dirname + '/app/book/page.tsx';
let c = fs.readFileSync(file, 'utf8');
const orig = c;

// Detect line ending
const eol = c.includes('\r\n') ? '\r\n' : '\n';
const E = eol;

// ── 1. Fix Sofia Krag photo (already done, but verify)
if (c.includes('photo-1573496359142-b8d87734a5a2?w=80')) {
  c = c.replace(
    '"Sofia Krag":   "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"',
    '"Sofia Krag":   "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"'
  );
  console.log('Sofia Krag photo: fixed');
} else {
  console.log('Sofia Krag photo: already updated or pattern not found');
}

// ── 2. Add sessionStorage + contract button
// The ConfirmScreen function starts at 'function ConfirmScreen({'
// Find the return statement inside it using CRLF-aware search
const fnMarker = 'function ConfirmScreen({';
const fnIdx = c.indexOf(fnMarker);
if (fnIdx === -1) { console.log('ERROR: ConfirmScreen not found'); process.exit(1); }

// Find 'return (' after the function start
const returnStr = 'return (' + E + '    <div>' + E + '      <div style={{ textAlign: "center", marginBottom: "28px" }}>';
const returnIdx = c.indexOf(returnStr, fnIdx);

if (returnIdx === -1) {
  console.log('return pattern not found. Looking for alternative...');
  const altIdx = c.indexOf('return (' + E + '    <div>', fnIdx);
  console.log('alt found at:', altIdx);
  console.log('chars:', JSON.stringify(c.slice(altIdx, altIdx + 120)));
} else {
  // Insert sessionStorage + refNr before the return statement
  const insertCode = 
    '  // Store contract data for /kontrakt page' + E +
    "  const refNr = 'NK-' + Math.random().toString(36).slice(2,8).toUpperCase();" + E +
    '  const _contractData = {' + E +
    '    refNr,' + E +
    '    clientName,' + E +
    '    clientEmail,' + E +
    '    serviceName: service.name,' + E +
    '    servicePrice: service.price,' + E +
    '    serviceDuration: service.duration,' + E +
    '    barber: staffMember.name,' + E +
    '    date: fmtDate(date),' + E +
    '    time,' + E +
    "    bookedAt: new Date().toLocaleDateString('da-DK', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })," + E +
    '  };' + E +
    "  try { sessionStorage.setItem('nordklip_pending_contract', JSON.stringify(_contractData)); } catch {}" + E +
    E;

  c = c.slice(0, returnIdx) + insertCode + c.slice(returnIdx);
  console.log('sessionStorage write: inserted');
}

// ── 3. Add "Download kontrakt" button
const bookAgainBtn = '<button onClick={onBookAgain} style={{ background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>' + E +
'          Book igen' + E +
'        </button>';

if (c.includes(bookAgainBtn)) {
  const contractBtn = E + 
    '        <Link href="/kontrakt" style={{ background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-secondary)", borderRadius: "6px", padding: "11px 22px", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>' + E +
    '          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' + E +
    '          Download kontrakt' + E +
    '        </Link>';
  
  // Insert after "Book igen" button
  c = c.replace(bookAgainBtn, bookAgainBtn + contractBtn);
  console.log('Download kontrakt button: inserted');
} else {
  console.log('Book igen button not found - checking...');
  const idx = c.indexOf('Book igen');
  if (idx > -1) console.log('Found "Book igen" at:', idx, JSON.stringify(c.slice(idx-100, idx+50)));
}

if (c !== orig) {
  fs.writeFileSync(file, c, 'utf8');
  console.log('Saved. Changes applied.');
} else {
  console.log('No net changes.');
}
