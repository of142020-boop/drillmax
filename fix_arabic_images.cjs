const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

files.forEach(f => {
  const p = path.join(dir, f);
  let code = fs.readFileSync(p, 'utf8');
  
  // Replace ANY path containing /wp-content/uploads/YYYY/MM/filename
  // with /images/filename
  code = code.replace(/\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^"]+)/g, '/images/$1');
  
  // Strip wordpress thumbnails (-300x250, etc) for ANY image path
  // Since we might have Arabic characters, we use [^/"]+ to match the filename up to -
  // Actually, just match -[0-9]+x[0-9]+ right before the extension
  code = code.replace(/-[0-9]+x[0-9]+\.(jpg|jpeg|png|webp|svg|gif)/g, '.$1');
  
  fs.writeFileSync(p, code);
  console.log('Fixed Arabic paths in ' + f);
});
