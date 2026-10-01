const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://drilmax.com';
const PUBLIC_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public';
const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// Download all wp-content resources from ALL page files
const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

const wpPaths = new Set();

rawFiles.forEach(filename => {
  const html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Match all wp-content paths in src="..." and href="..." and url(...)
  let match;
  
  const srcRe = /src="(\/wp-content\/[^"?#]+)/g;
  while ((match = srcRe.exec(html)) !== null) wpPaths.add(match[1]);
  
  const hrefRe = /href="(\/wp-content\/[^"?#]+)/g;
  while ((match = hrefRe.exec(html)) !== null) wpPaths.add(match[1]);
  
  // url() in inline CSS (but that's already downloaded via download_fonts)
});

const downloadFile = (filePath) => {
  return new Promise((resolve) => {
    const localPath = path.join(PUBLIC_DIR, filePath);
    const localDir = path.dirname(localPath);

    if (fs.existsSync(localPath)) {
      return resolve(); // Already downloaded
    }

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const fullUrl = BASE_URL + filePath;
    const client = fullUrl.startsWith('https') ? https : http;
    
    client.get(fullUrl, (res) => {
      if (res.statusCode === 200) {
        const stream = fs.createWriteStream(localPath);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); console.log('✓ ' + path.basename(filePath)); resolve(); });
        stream.on('error', () => resolve());
      } else {
        console.log('✗ ' + res.statusCode + ' - ' + path.basename(filePath));
        resolve();
      }
    }).on('error', (e) => { console.log('✗ ' + path.basename(filePath) + ': ' + e.message); resolve(); });
  });
};

async function run() {
  const paths = [...wpPaths];
  console.log('Found ' + paths.length + ' wp-content src/href resources to download across all pages...');
  
  for (const p of paths) {
    await downloadFile(p);
  }
  
  console.log('\n✅ Done! All wp-content JS/CSS resources downloaded.');
}

run();
