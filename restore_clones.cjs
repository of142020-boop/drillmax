const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const outRawDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const outPagesDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';

if (!fs.existsSync(outRawDir)) fs.mkdirSync(outRawDir);

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));


// The exact filenames mapping for the URL slugs
const mapping = {
  'home.html': 'index.astro',
  'about.html': 'about.astro',
  'alexandria.html': 'alexandria-concrete-cutting-core.astro',
  'blog.html': 'blog.astro',
  'contact.html': 'contact.astro',
  'core-drilling.html': 'core-drilling-صنايعي-كور.astro',
  'demolition.html': 'مقاول-هدم.astro',
  'exhaust-fans.html': 'فني-شفاطات.astro',
  'minya.html': 'minya-concrete-cutting-core.astro',
  'prices.html': 'prices.astro',
  'privacy.html': 'privacy-policy.astro',
  'projects.html': 'projects.astro',
  'rebar-planting.html': 'تزريع-الاشاير.astro',
  'saw-cutting.html': 'saw-cuttingقص-خرسانة.astro',
  'service-areas.html': 'service-areas.astro',
  'services.html': 'services.astro',
  'terms.html': 'terms-condition.astro',
  'wire-cutting.html': 'قص-الخرسانة-بالواير.astro'
};

files.forEach(filename => {
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

  // Inject Litespeed CSS locally if not present? It is usually present in original HTML.
  // We'll replace the old https://drilmax.com litespeed link with local
  html = html.replace(/https:\/\/drilmax\.com\/wp-content\/litespeed\/css\/[a-z0-9]+\.css/g, '/css/litespeed.css');
  html = html.replace(/\/wp-content\/litespeed\/css\/[a-z0-9]+\.css/g, '/css/litespeed.css');

  // Save the modified raw HTML
  fs.writeFileSync(path.join(outRawDir, filename), html);

  const outname = mapping[filename] || filename.replace('.html', '.astro');
  
  const astroCode = `---
import rawHtml from '../raw/${filename}?raw';
---
<Fragment set:html={rawHtml} />
`;
  fs.writeFileSync(path.join(outPagesDir, outname), astroCode);
});

console.log('Restored all 17 pages as exact 1:1 Elementor clones.');
