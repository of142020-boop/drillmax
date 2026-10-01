const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE_URL = 'https://drilmax.com';
const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// For each page, we need to find and inline any external CSS files
// that contain background-image rules for Elementor elements

const processPage = async (filename) => {
  const html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Find external CSS link tags (those remaining after LiteSpeed cache)
  const externalCSSLinks = [];
  let pos = 0;
  while (pos < html.length) {
    const s = html.indexOf('<link', pos);
    if (s === -1) break;
    const e = html.indexOf('>', s);
    const tag = html.slice(s, e + 1);
    if (tag.includes('stylesheet') && tag.includes('href="')) {
      const hrefM = tag.match(/href="([^"]+)"/);
      if (hrefM && !hrefM[1].startsWith('data:') && !hrefM[1].startsWith('//fonts')) {
        const href = hrefM[1];
        // Only grab wp-content CSS (not external CDNs)
        if (href.includes('/wp-content/') || href.startsWith('/wp-')) {
          externalCSSLinks.push({ tag, href, tagStart: s, tagEnd: e + 1 });
        }
      }
    }
    pos = e + 1;
  }

  if (externalCSSLinks.length === 0) {
    return { filename, cssCount: 0, inlined: 0 };
  }

  // Download and inline each external CSS
  let inlinedCount = 0;
  let newHtml = html;
  
  for (const link of externalCSSLinks) {
    const cssUrl = link.href.startsWith('http') ? link.href : BASE_URL + link.href;
    
    try {
      const cssContent = await fetchUrl(cssUrl);
      if (cssContent) {
        // Replace the <link> tag with inline <style>
        const inlineStyle = `<style>/* inlined: ${path.basename(link.href)} */\n${cssContent}\n</style>`;
        newHtml = newHtml.replace(link.tag, inlineStyle);
        inlinedCount++;
        process.stdout.write('.');
      }
    } catch (e) {
      // skip
    }
  }

  if (inlinedCount > 0) {
    fs.writeFileSync(path.join(RAW_DIR, filename), newHtml);
  }

  return { filename, cssCount: externalCSSLinks.length, inlined: inlinedCount };
};

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        res.resume();
        return;
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        if (enc === 'gzip') zlib.gunzip(buf, (e, d) => e ? resolve(null) : resolve(d.toString('utf8')));
        else if (enc === 'br') zlib.brotliDecompress(buf, (e, d) => e ? resolve(null) : resolve(d.toString('utf8')));
        else resolve(buf.toString('utf8'));
      });
    }).on('error', () => resolve(null));
  });
};

async function run() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));
  console.log('Inlining external CSS for ' + files.length + ' pages...\n');
  
  for (const f of files) {
    process.stdout.write(f + ': ');
    const result = await processPage(f);
    console.log(' Found ' + result.cssCount + ' ext CSS, inlined ' + result.inlined);
  }
  
  console.log('\n✅ Done!');
}

run();
