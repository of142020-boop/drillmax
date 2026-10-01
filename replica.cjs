const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const srcDir = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/scratch/drilmax_content';
const outDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';

const processFile = (filename, outname) => {
  let html = fs.readFileSync(path.join(srcDir, filename), 'utf8');
  
  // Fix lazy loaded images
  html = html.replace(/src="data:image\/svg\+xml;base64,[^"]+"[^>]+data-src="([^"]+)"/g, 'src="$1"');
  html = html.replace(/data-src="([^"]+)"[^>]+src="data:image\/svg\+xml;base64,[^"]+"/g, 'src="$1"');
  html = html.replace(/srcset="[^"]+"/g, '');
  
  // Fix arabic paths and typical image paths
  html = html.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^"]+)/g, '/images/$1');
  html = html.replace(/\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^"]+)/g, '/images/$1');
  
  // Strip thumbnails
  html = html.replace(/-[0-9]+x[0-9]+\.(jpg|jpeg|png|webp|svg|gif)/g, '.$1');

  // Strip Litespeed cache scripts and stats? No, keep it as is, just write it
  const astroCode = `---
// FULL ELEMENTOR REPLICA
---
${html}
`;
  fs.writeFileSync(path.join(outDir, outname), astroCode);
};

processFile('saw-cutting.html', 'saw-cuttingقص-خرسانة.astro');
console.log('Done creating 100% identical saw-cutting page');
