const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE_URL = 'https://drilmax.com';
const OUTPUT_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const pages = [
  { url: '/about/', file: 'about.html' },
  { url: '/contact/', file: 'contact.html' },
  { url: '/core-drilling-%d8%b5%d9%86%d8%a7%d9%8a%d8%b9%d9%8a-%d9%83%d9%88%d8%b1/', file: 'core-drilling.html' },
  { url: '/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/', file: 'saw-cutting.html' },
  { url: '/%d9%85%d9%82%d8%a7%d9%88%d9%84-%d9%87%d8%af%d9%85/', file: 'demolition.html' },
  { url: '/%d9%81%d9%86%d9%8a-%d8%b4%d9%81%d8%a7%d8%b7%d8%a7%d8%aa/', file: 'exhaust-fans.html' },
  { url: '/%d9%82%d8%b5-%d8%a7%d9%84%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9-%d8%a8%d8%a7%d9%84%d9%88%d8%a7%d9%8a%d8%b1/', file: 'wire-cutting.html' },
  { url: '/%d8%aa%d8%b2%d8%b1%d9%8a%d8%b9-%d8%a7%d9%84%d8%a7%d8%b4%d8%a7%d9%8a%d8%b1/', file: 'rebar-planting.html' },
  { url: '/%d8%a7%d8%b3%d8%b9%d8%a7%d8%b1-%d9%81%d8%aa%d8%ad%d8%a7%d8%aa-%d8%a7%d9%84%d9%83%d9%88%d8%b1/', file: 'prices.html' },
  { url: '/projects/', file: 'projects.html' },
  { url: '/blog/', file: 'blog.html' },
  { url: '/service-areas/', file: 'service-areas.html' },
  { url: '/services/', file: 'services.html' },
  { url: '/privacy-policy/', file: 'privacy.html' },
  { url: '/terms-condition/', file: 'terms.html' },
  { url: '/alexandria-concrete-cutting-core/', file: 'alexandria.html' },
  { url: '/minya-concrete-cutting-core/', file: 'minya.html' },
];

// Generate a unique cookie to bypass LiteSpeed Cache and get uncached (full CSS) response
const bypassHeaders = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'ar,en;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
  'Cache-Control': 'no-cache, no-store',
  'Pragma': 'no-cache',
  // LiteSpeed cache bypass cookie
  'Cookie': 'wordpress_logged_in_bypass=1; LSCACHE_VARY_VALUE=0',
};

const processHtml = (html) => {
  // Fix image paths
  html = html.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"'\s\)]+)/g, '/images/$1');
  html = html.replace(/\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"'\s\)]+)/g, '/images/$1');
  html = html.replace(/-\d+x\d+\.(jpg|jpeg|png|webp|svg|gif)/gi, '.$1');
  
  // Fix lazy images
  html = html.replace(/src="data:image\/svg\+xml;base64,[^"]+"\s+data-src="([^"]+)"/g, 'src="$1"');
  html = html.replace(/data-src="([^"]+)"\s+src="data:image\/svg\+xml;base64,[^"]+"/g, 'src="$1"');
  html = html.replace(/srcset="[^"]*"/g, '');

  // Fix internal links
  html = html.replace(/href="https?:\/\/drilmax\.com\//g, 'href="/');
  html = html.replace(/action="https?:\/\/drilmax\.com\//g, 'action="/');
  html = html.replace(/content="https?:\/\/drilmax\.com\//g, 'content="http://localhost:4321/');

  // Add background lazyload fix
  const fixScript = `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.elementor-invisible').forEach(function(el) {
    el.classList.remove('elementor-invisible');
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });
  document.querySelectorAll('[data-bg]').forEach(function(el) {
    el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
  });
});
</script>`;
  html = html.replace('</body>', fixScript + '\n</body>');
  return html;
};

const downloadPage = (pageUrl, filename) => {
  return new Promise((resolve) => {
    const fullUrl = BASE_URL + pageUrl;
    process.stdout.write('Downloading: ' + filename + '... ');
    
    const req = https.get(fullUrl, { headers: bypassHeaders }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redir = res.headers.location;
        res.resume();
        https.get(redir, { headers: bypassHeaders }, (res2) => handleResp(res2, filename, resolve));
      } else {
        handleResp(res, filename, resolve);
      }
    });
    req.on('error', (e) => { console.log('ERROR: ' + e.message); resolve(); });
  });
};

const handleResp = (res, filename, resolve) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    const encoding = res.headers['content-encoding'];
    
    const save = (data) => {
      let html = data.toString('utf8');
      const hasCSS = html.includes('litespeed-ucss') || html.includes('elementor-frontend-inline-css');
      html = processHtml(html);
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
      const sizeKB = Math.round(html.length / 1024);
      console.log('✓ ' + sizeKB + 'KB ' + (hasCSS ? '[WITH CSS]' : '[NO CSS - CACHED]'));
      resolve();
    };
    
    if (encoding === 'gzip') {
      zlib.gunzip(buf, (err, d) => err ? (console.log('✗ gzip error'), resolve()) : save(d));
    } else if (encoding === 'br') {
      zlib.brotliDecompress(buf, (err, d) => err ? (console.log('✗ br error'), resolve()) : save(d));
    } else if (encoding === 'deflate') {
      zlib.inflate(buf, (err, d) => err ? save(buf) : save(d));
    } else {
      save(buf);
    }
  });
};

async function run() {
  for (const page of pages) {
    await downloadPage(page.url, page.file);
  }
  console.log('\n✅ Done!');
}

run();
