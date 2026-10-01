const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const PUBLIC_IMAGES = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/images';

const html = fs.readFileSync(path.join(RAW_DIR, 'home.html'), 'utf8');

// Find data-bg attributes (Elementor lazy background images)
const dataBgMatches = [];
let pos = 0;
while (pos < html.length) {
  const start = html.indexOf('data-bg="', pos);
  if (start === -1) break;
  const valStart = start + 9;
  const valEnd = html.indexOf('"', valStart);
  const val = html.slice(valStart, valEnd);
  dataBgMatches.push(val);
  pos = valEnd + 1;
}

// Find style="background-image:url(...)"  
const bgImageMatches = [];
const bgRe = /background-image\s*:\s*url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/g;
let m;
while ((m = bgRe.exec(html)) !== null) {
  bgImageMatches.push(m[1]);
}

console.log('=== data-bg images found: ' + dataBgMatches.length + ' ===');
dataBgMatches.slice(0,10).forEach(u => console.log(u));

console.log('\n=== background-image CSS images found: ' + bgImageMatches.length + ' ===');
bgImageMatches.slice(0,10).forEach(u => console.log(u));

// Check which local image files might be missing
console.log('\n=== Checking local images dir ===');
const imageFiles = fs.readdirSync(PUBLIC_IMAGES);
console.log('Total images in /public/images: ' + imageFiles.length);
