const fs = require('fs');
const REDIRECT = 'https://nordklip.pages.dev';

// admin, kunder, owner — all use function handleLogout with try/catch removing bf_owner
['app/admin/page.tsx', 'app/kunder/page.tsx', 'app/owner/page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Match: function handleLogout() { try { ... } catch {} ... }
  c = c.replace(
    /function handleLogout\(\)\s*\{[\s\S]*?sessionStorage\.removeItem\("bf_owner"\)[\s\S]*?\n\s*\}/m,
    `function handleLogout() { try { sessionStorage.removeItem("bf_owner"); sessionStorage.removeItem("bf_session"); } catch {} window.location.href = "${REDIRECT}"; }`
  );
  fs.writeFileSync(f, c, 'utf8');
  console.log(f + ': done');
});

// team — function handleLogout removes bf_team
let team = fs.readFileSync('app/team/page.tsx', 'utf8');
team = team.replace(
  /function handleLogout\(\)\{[\s\S]*?setMember\(null\);\}/,
  `function handleLogout(){try{sessionStorage.removeItem("bf_team");sessionStorage.removeItem("bf_session");}catch{} window.location.href="${REDIRECT}";}`
);
fs.writeFileSync('app/team/page.tsx', team, 'utf8');
console.log('team: done');

// book + bookings — inline onclick uses router.push("/")
['app/book/page.tsx', 'app/bookings/page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/router\.push\(["']\/["']\)/g, `window.location.href = "${REDIRECT}"`);
  fs.writeFileSync(f, c, 'utf8');
  console.log(f + ': done');
});
