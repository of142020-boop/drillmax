const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.astro'));

files.forEach(f => {
  const p = path.join(dir, f);
  let code = fs.readFileSync(p, 'utf8');
  
  // 1. Fix src attributes for lazyloaded images
  code = code.replace(/src="data:image\/svg\+xml;base64,[^"]+"[^>]+data-src="([^"]+)"/g, 'src="$1"');
  code = code.replace(/src="data:image\/svg\+xml;base64,[^"]+"[^>]+data-src='([^']+)'/g, 'src="$1"');

  // fallback if data-src appears before src
  code = code.replace(/data-src="([^"]+)"[^>]+src="data:image\/svg\+xml;base64,[^"]+"/g, 'src="$1"');
  
  // 2. Remove srcset and data-srcset to prevent broken responsive images
  code = code.replace(/srcset="[^"]+"/g, '');
  code = code.replace(/data-srcset="[^"]+"/g, '');
  code = code.replace(/sizes="[^"]+"/g, '');
  code = code.replace(/data-sizes="[^"]+"/g, '');
  
  // 3. Strip wordpress thumbnail sizing -300x251 from filenames
  code = code.replace(/\/images\/([^/]+)-[0-9]+x[0-9]+\.(jpg|jpeg|png|webp|svg)/g, '/images/$1.$2');
  
  fs.writeFileSync(p, code);
  console.log('Fixed images in ' + f);
});
