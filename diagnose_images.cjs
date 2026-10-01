const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const html = fs.readFileSync(path.join(RAW_DIR, 'core-drilling.html'), 'utf8');

// Find all img tags and their src values
const imgSrcs = [];
let pos = 0;
while (pos < html.length) {
  const s = html.indexOf('<img', pos);
  if (s === -1) break;
  const e = html.indexOf('>', s);
  const tag = html.slice(s, e + 1);
  
  // Get src
  const srcM = tag.match(/src="([^"]+)"/);
  const dataSrcM = tag.match(/data-src="([^"]+)"/);
  
  imgSrcs.push({
    src: srcM ? srcM[1] : 'NONE',
    dataSrc: dataSrcM ? dataSrcM[1] : null,
    isLazy: tag.includes('lazyload') || tag.includes('data-src'),
    isBase64: srcM && srcM[1].startsWith('data:'),
  });
  pos = e + 1;
}

console.log('Total images in core-drilling.html: ' + imgSrcs.length);
console.log('\nLazy images (data-src but src=base64):');
imgSrcs.filter(i => i.isBase64 || i.isLazy).slice(0,10).forEach(i => {
  console.log('  src: ' + i.src.substring(0, 60));
  if (i.dataSrc) console.log('  data-src: ' + i.dataSrc.substring(0, 60));
});

console.log('\nNormal images with /images/ path:');
imgSrcs.filter(i => i.src.startsWith('/images/')).slice(0,10).forEach(i => {
  console.log('  ' + i.src);
});

// Now look for the specific service cards images - they are likely in the HTML
// but hidden or with wrong path
console.log('\n\nSearching for webp images...');
const webpMatches = html.match(/\/images\/[^\s"']+\.webp/g) || [];
const unique = [...new Set(webpMatches)];
unique.slice(0,15).forEach(u => console.log('  ' + u));
