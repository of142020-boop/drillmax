const fs = require('fs');
const path = require('path');

const rawDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.html'));

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(rawDir, filename), 'utf8');
  const originalLength = html.length;
  
  // Fix all internal absolute links href="https://drilmax.com/..." -> href="/..."
  html = html.replace(/href="https:\/\/drilmax\.com\//g, 'href="/');
  html = html.replace(/href='https:\/\/drilmax\.com\//g, "href='/");
  
  // Fix action="https://drilmax.com/..." -> action="/..."
  html = html.replace(/action="https:\/\/drilmax\.com\//g, 'action="/');
  
  // Fix src="https://drilmax.com/wp-content/..." -> already handled but do again
  // But NOT for images (already fixed), just scripts/fonts
  html = html.replace(/src="https:\/\/drilmax\.com\/wp-includes\//g, 'src="https://drilmax.com/wp-includes/');
  
  // Fix CSS/JS resource links - keep external ones pointing to drilmax.com
  // But fix navigation href links only
  
  const fixed = html.length !== originalLength || html.includes('href="/') ? 1 : 0;
  totalFixed += fixed;
  
  fs.writeFileSync(path.join(rawDir, filename), html);
  console.log(`Fixed internal links in: ${filename}`);
});

console.log(`\n✅ Done! Fixed ${totalFixed} files.`);
console.log('All href="https://drilmax.com/..." have been converted to href="/..."');
