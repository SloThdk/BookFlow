const fs = require('fs');

// Fix 1: owner/page.tsx — remove "Ikke ejer? Book en tid i stedet"
const ownerFile = __dirname + '/app/owner/page.tsx';
let owner = fs.readFileSync(ownerFile, 'utf8');
const ownerOrig = owner;

owner = owner.replace(
  `\n        <div style={{ textAlign: "center", marginTop: "20px" }}>\n          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>\n            Ikke ejer? Book en tid i stedet\n          </Link>\n        </div>`,
  ''
);

if (owner !== ownerOrig) {
  fs.writeFileSync(ownerFile, owner, 'utf8');
  console.log('owner/page.tsx: escape link removed');
} else {
  console.log('owner/page.tsx: no match - checking manually...');
  const idx = owner.indexOf('Ikke ejer');
  if (idx >= 0) console.log('Found at char', idx, ':', JSON.stringify(owner.slice(idx - 50, idx + 80)));
}

// Fix 2: team/page.tsx — remove "Ejer? Log ind via ejersystemet →"
const teamFile = __dirname + '/app/team/page.tsx';
let team = fs.readFileSync(teamFile, 'utf8');
const teamOrig = team;

team = team.replace(
  `\n        <div style={{textAlign:"center",marginTop:"16px"}}>\n          <Link href="/owner" style={{fontSize:"12px",color:"var(--text-muted)",textDecoration:"none"}}>Ejer? Log ind via ejersystemet \u2192</Link>\n        </div>`,
  ''
);

if (team !== teamOrig) {
  fs.writeFileSync(teamFile, team, 'utf8');
  console.log('team/page.tsx: escape link removed');
} else {
  console.log('team/page.tsx: no match - checking manually...');
  const idx = team.indexOf('Ejer? Log ind');
  if (idx >= 0) console.log('Found at char', idx, ':', JSON.stringify(team.slice(idx - 50, idx + 80)));
}
