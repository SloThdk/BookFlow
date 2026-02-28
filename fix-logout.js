const fs = require('fs');

const files = ['app/book/page.tsx', 'app/bookings/page.tsx', 'app/components/OwnerSidebar.tsx', 'app/team/page.tsx', 'app/admin/page.tsx', 'app/kunder/page.tsx', 'app/medarbejdere/page.tsx'];

for (const f of files) {
  try {
    let c = fs.readFileSync(f, 'utf8');
    // Replace router.push("/") with redirect to nordklip public site
    const before = c;
    c = c.replace(
      /router\.push\(["']\/["']\)/g,
      'window.location.href = "https://nordklip.pages.dev"'
    );
    if (c !== before) {
      fs.writeFileSync(f, c, 'utf8');
      console.log(f + ': fixed');
    } else {
      console.log(f + ': no router.push("/") found');
    }
  } catch (e) {
    console.log(f + ': ' + e.code);
  }
}
