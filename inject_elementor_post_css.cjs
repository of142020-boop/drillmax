const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE_URL = 'https://drilmax.com';
const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// The inlined CSS file has a name like "5345aec6b3491df9371244f0ff0eca09.css"
// This is the combined/cached elementor CSS
// We need the SPECIFIC post CSS which has background images for each page
// The elementor post CSS URL pattern is: /wp-content/cache/elementor/css/post-[POST_ID].css

// First, let's find the POST IDs from each raw HTML
const getPostCSS = async (filename) => {
  const html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Find elementor post ID from body class or data attribute
  const postIdMatch = html.match(/class="[^"]*\bpostid-(\d+)\b[^"]*"/)
    || html.match(/body.*?class="[^"]*\bpost-(\d+)\b[^"]*"/)
    || html.match(/\"@id\":\s*\"http[^\"]+\/#webpage\"/)  // json-ld
    || html.match(/post_id[\":\s]+(\d+)/);
  
  if (!postIdMatch) {
    // Try body class
    const bodyClass = html.match(/<body[^>]+class="([^"]+)"/);
    if (bodyClass) {
      const postId = bodyClass[1].match(/\bpostid-(\d+)\b/);
      if (postId) return postId[1];
    }
    return null;
  }
  return postIdMatch[1];
};

const fetchCSS = (url) => {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        if (enc === 'gzip') zlib.gunzip(buf, (e, d) => resolve(e ? null : d.toString()));
        else if (enc === 'br') zlib.brotliDecompress(buf, (e, d) => resolve(e ? null : d.toString()));
        else resolve(buf.toString());
      });
    }).on('error', () => resolve(null));
  });
};

const processFile = async (filename) => {
  const html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Extract post ID from body class  
  const bodyMatch = html.match(/<body[^>]+class="([^"]+)"/);
  if (!bodyMatch) {
    console.log('[SKIP]  ' + filename + ': no body class');
    return;
  }
  
  const bodyClass = bodyMatch[1];
  const postIdMatch = bodyClass.match(/\bpostid-(\d+)\b/) || bodyClass.match(/\bpage-id-(\d+)\b/) || bodyClass.match(/\bpost-(\d+)\b/);
  if (!postIdMatch) {
    console.log('[SKIP]  ' + filename + ': no postid- in body class');
    return;
  }
  
  const postId = postIdMatch[1];
  const cssUrl = BASE_URL + '/wp-content/cache/elementor/css/post-' + postId + '.css';
  
  process.stdout.write('[' + filename + '] postid=' + postId + ' fetching CSS... ');
  
  const cssContent = await fetchCSS(cssUrl);
  if (!cssContent) {
    console.log('FAILED (404 or error)');
    return;
  }
  
  const hasBg = cssContent.includes('background-image');
  console.log('OK (' + Math.round(cssContent.length/1024) + 'KB, has-bg: ' + hasBg + ')');
  
  if (hasBg) {
    // Fix image paths in the CSS
    let fixedCSS = cssContent;
    fixedCSS = fixedCSS.replace(/https?:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
    fixedCSS = fixedCSS.replace(/\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
    fixedCSS = fixedCSS.replace(/-\d+x\d+\.(jpg|jpeg|png|webp|gif)/gi, '.$1');
    
    // Inject this CSS into the page HTML
    let newHtml = html;
    const styleTag = '\n<style id="elementor-post-' + postId + '">\n' + fixedCSS + '\n</style>\n';
    newHtml = newHtml.replace('</head>', styleTag + '</head>');
    
    fs.writeFileSync(path.join(RAW_DIR, filename), newHtml);
    console.log('  → CSS injected into ' + filename);
  }
};

async function run() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));
  for (const f of files) {
    await processFile(f);
  }
  console.log('\n✅ Done!');
}

run();
