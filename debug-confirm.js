const fs = require('fs');
const c = fs.readFileSync(__dirname + '/app/book/page.tsx', 'utf8');
const fnStart = c.indexOf('function ConfirmScreen(');
// Find return statement within first 3000 chars of function
const snippet = c.slice(fnStart, fnStart + 3000);
const retIdx = snippet.indexOf('return (');
console.log('return( offset from fn:', retIdx);
if (retIdx > -1) {
  console.log('Exact content:', JSON.stringify(snippet.slice(retIdx, retIdx + 200)));
}
