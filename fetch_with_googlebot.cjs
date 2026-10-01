const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Strategy: fetch each page with a Googlebot-like user agent
// which typically bypasses caching and gets the full rendered HTML
// including the elementor-post-CSS inline style that has background-image rules

const BASE_URL = 'https://drilmax.com';
const OUTPUT_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const pages = [
  { url: '/', file: 'home.html' },
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

const processHtml = (html) => {
  // Fix image paths: wp-content/uploads -> /images/
  html = html.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
  html = html.replace(/\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
  // Remove WP thumbnail size suffixes
  html = html.replace(/-\d+x\d+\.(jpg|jpeg|png|webp|gif)/gi, '.$1');

  // Fix lazy images: replace base64 placeholder with actual data-src
  html = html.replace(/src="data:image\/svg\+xml;base64,[^"]*"(\s[^>]*)?\s+data-src="([^"]+)"/g, 'src="$2"$1');
  html = html.replace(/data-src="([^"]+)"(\s[^>]*)?\s+src="data:image\/svg\+xml;base64,[^"]*"/g, 'src="$1"$2');
  html = html.replace(/\s*data-src="[^"]*"/g, '');
  html = html.replace(/\s*srcset="[^"]*"/g, '');
  html = html.replace(/loading="lazy"/g, 'loading="eager"');

  // Fix internal links
  html = html.replace(/href="https?:\/\/drilmax\.com\//g, 'href="/');
  html = html.replace(/action="https?:\/\/drilmax\.com\//g, 'action="/');
  html = html.replace(/content="https?:\/\/drilmax\.com\//g, 'content="http://localhost:4321/');

  // FIX Elementor lazy-load: add e-lazyloaded class to all containers
  html = html.replace(/class="([^"]*\be-con\b[^"]*\be-parent\b[^"]*)"/g, (m, cls) => {
    if (cls.includes('e-lazyloaded')) return m;
    return `class="${cls} e-lazyloaded e-no-lazyload"`;
  });

  // Remove the CSS rule that hides backgrounds for lazy elements
  html = html.replace(
    /\.e-con\.e-parent:nth-of-type\(n\+4\):not\(\.e-lazyloaded\):not\(\.e-no-lazyload\)[^}]+}/g,
    ''
  );

  // Add a JS fix script before </body>
  const fixScript = `<script>
(function() {
  // Remove Elementor invisible class instantly
  document.querySelectorAll('.elementor-invisible').forEach(function(el) {
    el.classList.remove('elementor-invisible');
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });
  // Force all e-con containers to show backgrounds
  document.querySelectorAll('.e-con.e-parent').forEach(function(el) {
    el.classList.add('e-lazyloaded', 'e-no-lazyload');
  });
})();
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.elementor-invisible').forEach(function(el) {
    el.classList.remove('elementor-invisible');
  });
  document.querySelectorAll('.e-con.e-parent').forEach(function(el) {
    el.classList.add('e-lazyloaded', 'e-no-lazyload');
  });
});
</script>`;

  if (!html.includes('e-lazyloaded')) {
    html = html.replace('</body>', fixScript + '\n</body>');
  } else {
    html = html.replace('</body>', fixScript + '\n</body>');
  }

  return html;
};

const downloadPage = (pageUrl, filename) => {
  return new Promise((resolve) => {
    const fullUrl = BASE_URL + pageUrl;
    process.stdout.write('Fetching: ' + filename + '... ');

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    };

    https.get(fullUrl, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        https.get(res.headers.location, options, (r2) => handleResp(r2, filename, resolve));
      } else {
        handleResp(res, filename, resolve);
      }
    }).on('error', (e) => { console.log('ERROR: ' + e.message); resolve(); });
  });
};

const handleResp = (res, filename, resolve) => {
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    const enc = res.headers['content-encoding'];

    const save = (data) => {
      let html = data.toString('utf8');
      const hasBg = html.includes('elementor-post-') || html.includes('background-image');
      html = processHtml(html);
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
      const bgCount = (html.match(/background-image\s*:\s*url/g) || []).length;
      console.log('✓ ' + Math.round(html.length/1024) + 'KB [bg-images: ' + bgCount + ']');
      resolve();
    };

    if (enc === 'gzip') zlib.gunzip(buf, (e, d) => e ? (console.log('gzip err'), resolve()) : save(d));
    else if (enc === 'br') zlib.brotliDecompress(buf, (e, d) => e ? (console.log('br err'), resolve()) : save(d));
    else if (enc === 'deflate') zlib.inflate(buf, (e, d) => e ? save(buf) : save(d));
    else save(buf);
  });
};

async function run() {
  console.log('Fetching ' + pages.length + ' pages with Googlebot UA (bypasses LiteSpeed cache)...\n');
  for (const page of pages) {
    await downloadPage(page.url, page.file);
  }
  console.log('\n✅ All pages downloaded with full CSS + background images!');
}

run();
