const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  const before = html;

  // Fix wp-content/uploads paths inside CSS (background-image: url(...))
  // These appear as url(/wp-content/uploads/YEAR/MONTH/filename.ext)
  html = html.replace(/url\(\/wp-content\/uploads\/\d{4}\/\d{2}\/([^)]+)\)/g, 'url(/images/$1)');
  html = html.replace(/url\("\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"]+)"\)/g, 'url("/images/$1")');
  html = html.replace(/url\('\/wp-content\/uploads\/\d{4}\/\d{2}\/([^']+)'\)/g, "url('/images/$1')");
  
  // Also fix https:// absolute paths in CSS
  html = html.replace(/url\(https?:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^)]+)\)/g, 'url(/images/$1)');
  html = html.replace(/url\("https?:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"]+)"\)/g, 'url("/images/$1")');
  
  // Remove WP thumbnail suffixes in CSS url() too
  html = html.replace(/(url\([^)]*)-\d+x\d+\.(jpg|jpeg|png|webp|gif)(\))/gi, '$1.$2$3');
  html = html.replace(/(url\("[^"]*)-\d+x\d+\.(jpg|jpeg|png|webp|gif)(")/gi, '$1.$2$3');

  if (html !== before) {
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    const bgCount = (html.match(/background-image\s*:\s*url/g) || []).length;
    console.log('[FIXED] ' + filename + ' - ' + bgCount + ' bg-image URLs fixed');
    totalFixed++;
  } else {
    const bgCount = (html.match(/background-image\s*:\s*url/g) || []).length;
    console.log('[OK]    ' + filename + ' - ' + bgCount + ' bg-images (no wp-content paths found)');
  }
});

console.log('\n✅ Done! Fixed CSS bg-image paths in ' + totalFixed + ' files.');
