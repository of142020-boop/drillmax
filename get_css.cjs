const fs = require('fs');
const html = fs.readFileSync('./src/raw/home.html', 'utf8');

// Find all CSS href in link tags using simple string matching
const cssFiles = [];
let pos = 0;
while (pos < html.length) {
  const linkStart = html.indexOf('<link', pos);
  if (linkStart === -1) break;
  const linkEnd = html.indexOf('>', linkStart);
  const linkTag = html.slice(linkStart, linkEnd + 1);
  if (linkTag.includes('stylesheet')) {
    const hrefMatch = linkTag.match(/href="([^"]+)"/);
    if (hrefMatch) cssFiles.push(hrefMatch[1]);
  }
  pos = linkEnd + 1;
}

cssFiles.forEach(f => console.log(f));
