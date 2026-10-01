const fs = require('fs');
const path = require('path');

const rawDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  let html = fs.readFileSync(path.join(rawDir, filename), 'utf8');

  // Fix ALL href links pointing to drilmax.com (nav, logo, buttons, everything)
  html = html.replace(/href="https?:\/\/drilmax\.com\//g, 'href="/');
  html = html.replace(/href='https?:\/\/drilmax\.com\//g, "href='/");

  // Fix action= on forms
  html = html.replace(/action="https?:\/\/drilmax\.com\//g, 'action="/');

  // Fix data-menu-items or data-url attributes too
  html = html.replace(/data-url="https?:\/\/drilmax\.com\//g, 'data-url="/');
  html = html.replace(/"url":"https?:\\\/\\\/drilmax\.com\\\//g, '"url":"\\/');

  // Fix canonical link tags too
  html = html.replace(/<link rel="canonical" href="https?:\/\/drilmax\.com([^"]*)"/g, '<link rel="canonical" href="http://localhost:4321$1"');

  // Fix wp-json and feeds - keep them working too
  // (already covered since they start with https://drilmax.com/)

  fs.writeFileSync(path.join(rawDir, filename), html);
  
  // Count remaining drilmax.com hrefs
  const remaining = (html.match(/href="https?:\/\/drilmax\.com/g) || []).length;
  console.log(`${filename}: ${remaining} remaining external hrefs`);
});

console.log('\n✅ ALL internal links fixed in raw HTML files!');
