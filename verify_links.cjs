const fs = require('fs');
const html = fs.readFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw/home.html', 'utf8');

const remaining = html.match(/href="https:\/\/drilmax\.com[^"]+"/g);
if (remaining) {
  console.log('Still absolute:');
  remaining.slice(0,5).forEach(l => console.log(l));
} else {
  console.log('All internal hrefs fixed!');
}

const localLinks = html.match(/href="\/[^"]{1,60}"/g);
if (localLinks) {
  console.log('\nSample local links:');
  localLinks.slice(0,8).forEach(l => console.log(l));
}
