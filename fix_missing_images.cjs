const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const PUBLIC_IMAGES = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/images';

// Image substitutions for missing files
const substitutions = {
  '/images/منشار-خرسانة.webp': '/images/تقطيع-بمنشار-الخرسانة.webp',
  '/images/كور-دريل-1.webp': '/images/صنايعي-كور-دريل-1.webp',
};

const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));
let totalReplacements = 0;

rawFiles.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  let changed = false;
  
  for (const [from, to] of Object.entries(substitutions)) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      console.log('Replaced "' + from + '" -> "' + to + '" in ' + filename);
      changed = true;
      totalReplacements++;
    }
  }
  
  if (changed) {
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
  }
});

console.log('\n✅ Done! Made ' + totalReplacements + ' substitutions across all raw HTML files.');
