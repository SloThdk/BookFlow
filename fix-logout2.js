const fs = require('fs');

// Fix owner pages - handleLogout should redirect to nordklip.pages.dev
const ownerFiles = ['app/admin/page.tsx', 'app/kunder/page.tsx', 'app/medarbejdere/page.tsx', 'app/owner/page.tsx'];

for (const f of ownerFiles) {
  let c = fs.readFileSync(f, 'utf8');
  // Replace setMember(null) or similar logout that stays on page
  // Find handleLogout function and make it redirect
  if (c.includes('function handleLogout')) {
    c = c.replace(
      /function handleLogout\(\)\s*\{[^}]*\}/,
      'function handleLogout() { try { sessionStorage.removeItem("bf_owner"); sessionStorage.removeItem("bf_session"); } catch {} window.location.href = "https://nordklip.pages.dev"; }'
    );
    fs.writeFileSync(f, c, 'utf8');
    console.log(f + ': fixed handleLogout');
  } else {
    console.log(f + ': no handleLogout found, checking for inline');
    // Check for const handleLogout = 
    if (c.includes('handleLogout')) {
      c = c.replace(
        /const handleLogout\s*=\s*\(\)\s*=>\s*\{[^}]*\}/,
        'const handleLogout = () => { try { sessionStorage.removeItem("bf_owner"); sessionStorage.removeItem("bf_session"); } catch {} window.location.href = "https://nordklip.pages.dev"; }'
      );
      fs.writeFileSync(f, c, 'utf8');
      console.log(f + ': fixed const handleLogout');
    }
  }
}

// Fix team page
let team = fs.readFileSync('app/team/page.tsx', 'utf8');
team = team.replace(
  /function handleLogout\(\)\{[^}]*\}/,
  'function handleLogout(){try{sessionStorage.removeItem("bf_team");sessionStorage.removeItem("bf_session");}catch{} window.location.href="https://nordklip.pages.dev";}'
);
fs.writeFileSync('app/team/page.tsx', team, 'utf8');
console.log('app/team/page.tsx: fixed');
