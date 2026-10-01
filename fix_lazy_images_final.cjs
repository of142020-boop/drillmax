const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  const originalHtml = html;

  // Fix 1: Replace lazy src="data:image/svg+xml;base64,..." with the actual data-src
  // Pattern: src="data:image/svg+xml;base64,[...]" ... data-src="REAL_URL"
  html = html.replace(
    /src="data:image\/svg\+xml;base64,[^"]*"(\s[^>]*)?\s+data-src="([^"]+)"/g,
    'src="$2"$1'
  );
  
  // Also the reverse order: data-src first, then src=base64
  html = html.replace(
    /data-src="([^"]+)"(\s[^>]*)?\s+src="data:image\/svg\+xml;base64,[^"]*"/g,
    'src="$1"$2'
  );

  // Fix 2: Any remaining data-src that hasn't been replaced, make it the src
  // This handles cases where data-src appears but no base64 placeholder
  html = html.replace(/(<img[^>]+)data-src="([^"]+)"([^>]*)>/g, (match, before, dataSrc, after) => {
    // If img already has a real src (not base64), keep it
    if (before.includes('src="') && !before.includes('src="data:')) {
      return match; // Already has real src
    }
    // Replace the src with data-src value
    if (before.includes('src="data:')) {
      const fixed = before.replace(/src="data:[^"]*"/, `src="${dataSrc}"`);
      return `${fixed}${after}>`;
    }
    // Add src attribute
    return `${before} src="${dataSrc}"${after}>`;
  });

  // Fix 3: Remove all remaining srcset attributes (they cause issues with local paths)
  html = html.replace(/\s*srcset="[^"]*"/g, '');
  
  // Fix 4: Remove sizes attribute (not needed without srcset)  
  html = html.replace(/\s*sizes="[^"]*"/g, '');

  // Fix 5: Remove lazy loading classes that prevent display
  // Keep the class but add loading="eager" to prevent lazy behavior
  html = html.replace(/(<img[^>]+)loading="lazy"([^>]*)>/g, '$1loading="eager"$2>');
  html = html.replace(/(<img[^>]+)class="([^"]*)\blazyload\b([^"]*)"([^>]*)>/g, 
    '$1class="$2$3"$4>');

  // Fix 6: Remove data-src attributes that are no longer needed (cleanup)
  html = html.replace(/\s*data-src="[^"]*"/g, '');
  html = html.replace(/\s*data-srcset="[^"]*"/g, '');

  const imgCount = (html.match(/<img[^>]+src="\/images\//g) || []).length;
  
  if (html !== originalHtml) {
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    totalFixed++;
    console.log('[FIXED] ' + filename + ' - ' + imgCount + ' real images now');
  } else {
    console.log('[OK]    ' + filename + ' - ' + imgCount + ' images');
  }
});

console.log('\n✅ Done! Fixed lazy images in ' + totalFixed + ' files.');
