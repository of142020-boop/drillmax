const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  const before = html;

  // FIX 1: Remove the Elementor lazy-load CSS that hides background images
  // This pattern hides ALL backgrounds for containers beyond 3rd element
  html = html.replace(
    /\.e-con\.e-parent:nth-of-type\(n\+4\):not\(\.e-lazyloaded\):not\(\.e-no-lazyload\)[^{]*\{[^}]*background-image\s*:\s*none\s*!important[^}]*\}/g,
    '.e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) { /* lazyload removed */ }'
  );
  
  html = html.replace(
    /\.e-con\.e-parent:nth-of-type\(n\+4\):not\(\.e-lazyloaded\):not\(\.e-no-lazyload\)\s*\*[^{]*\{[^}]*background-image\s*:\s*none\s*!important[^}]*\}/g,
    '.e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) * { /* lazyload removed */ }'
  );

  // FIX 2: Add class e-lazyloaded to ALL e-con.e-parent elements so they show their backgrounds
  html = html.replace(/class="([^"]*\be-con\b[^"]*\be-parent\b[^"]*)"/g, 'class="$1 e-lazyloaded e-no-lazyload"');
  html = html.replace(/class="([^"]*\be-parent\b[^"]*\be-con\b[^"]*)"/g, 'class="$1 e-lazyloaded e-no-lazyload"');

  // FIX 3: Also remove any inline style that sets background-image: none
  html = html.replace(/style="([^"]*)background-image\s*:\s*none\s*!important([^"]*)"/g, 'style="$1$2"');

  if (html !== before) {
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    totalFixed++;
    console.log('[FIXED] ' + filename);
  } else {
    console.log('[OK]    ' + filename + ' (no lazy CSS found)');
  }
});

console.log('\n✅ Done! Fixed Elementor lazy-load CSS in ' + totalFixed + ' files.');
