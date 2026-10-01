const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const html = fs.readFileSync(path.join(RAW_DIR, 'saw-cutting.html'), 'utf8');

// Find all background-image: url() occurrences
const bgMatches = [];
let pos = 0;
while (pos < html.length) {
  const idx = html.indexOf('background-image', pos);
  if (idx === -1) break;
  bgMatches.push(html.slice(idx, idx + 200));
  pos = idx + 1;
}

console.log('background-image occurrences in saw-cutting.html:');
bgMatches.slice(0, 5).forEach((m, i) => {
  console.log('\n[' + i + '] ' + m.substring(0, 150));
});

// Also check what images are referenced in the inlined CSS
const inlinedStyle = html.match(/<style>[^<]*inlined:[^<]*<\/style>/);
if (inlinedStyle) {
  console.log('\n\nInlined style (first 500 chars):');
  console.log(inlinedStyle[0].substring(0, 500));
}
