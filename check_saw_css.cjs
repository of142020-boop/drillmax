const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const html = fs.readFileSync(path.join(RAW_DIR, 'saw-cutting.html'), 'utf8');

// Find all <style> tags and their IDs and sizes
const styles = [];
let pos = 0;
while (pos < html.length) {
  const s = html.indexOf('<style', pos);
  if (s === -1) break;
  const e = html.indexOf('</style>', s) + '</style>'.length;
  const block = html.slice(s, e);
  const idM = block.match(/id="([^"]+)"/);
  styles.push({ id: idM ? idM[1] : 'no-id', size: Math.round(block.length/1024) + 'KB' });
  pos = e;
}

console.log('Style blocks in saw-cutting.html:');
styles.forEach(s => console.log('  ' + s.id + ': ' + s.size));

const bgCount = (html.match(/background-image\s*:\s*url/g) || []).length;
console.log('\nbackground-image count: ' + bgCount);

// Check if elementor-frontend-inline-css exists
console.log('Has elementor-frontend-inline-css: ' + html.includes('elementor-frontend-inline-css'));
console.log('Has astra-theme-css: ' + html.includes('astra-theme-css-inline-css'));
