const fs = require('fs');

const redirect = 'window.location.href = "https://nordklip.pages.dev"';

// Fix all files with broken double catch
const files = ['app/admin/page.tsx', 'app/kunder/page.tsx', 'app/medarbejdere/page.tsx', 'app/owner/page.tsx', 'app/team/page.tsx', 'app/book/page.tsx', 'app/bookings/page.tsx'];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  
  // Fix broken "} catch {} window.location... } catch {}" patterns
  c = c.replace(
    /function handleLogout\(\)\s*\{[^]*?nordklip\.pages\.dev[^}]*\}\s*catch\s*\{\}/g,
    `function handleLogout() { try { sessionStorage.removeItem("bf_owner"); sessionStorage.removeItem("bf_team"); sessionStorage.removeItem("bf_session"); } catch {} ${redirect}; }`
  );
  
  // Also fix arrow function variants
  c = c.replace(
    /const handleLogout\s*=\s*\(\)\s*=>\s*\{[^]*?nordklip\.pages\.dev[^}]*\}\s*catch\s*\{\}/g,
    `const handleLogout = () => { try { sessionStorage.removeItem("bf_owner"); sessionStorage.removeItem("bf_team"); sessionStorage.removeItem("bf_session"); } catch {} ${redirect}; }`
  );

  // Fix inline onclick logout that goes to nordklip already 
  // Also handle book/bookings which used window.location.href inline
  
  fs.writeFileSync(f, c, 'utf8');
  console.log(f + ': cleaned');
}
