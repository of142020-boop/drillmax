const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://drilmax.com';
const PUBLIC_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public';
const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));
const wpPaths = new Set();

rawFiles.forEach(filename => {
  const html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Find all <script src="..."> tags
  let pos = 0;
  while (pos < html.length) {
    const s = html.indexOf('<script', pos);
    if (s === -1) break;
    const e = html.indexOf('>', s);
    const tag = html.slice(s, e + 1);
    // Get src attribute  
    const m1 = tag.match(/src="([^"]+)"/);
    if (m1 && m1[1].startsWith('/wp-content/')) {
      wpPaths.add(m1[1].split('?')[0]);
    }
    pos = e + 1;
  }
});

const downloadFile = (filePath) => {
  return new Promise((resolve) => {
    const localPath = path.join(PUBLIC_DIR, filePath);
    const localDir = path.dirname(localPath);

    if (fs.existsSync(localPath)) return resolve();

    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

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
    }).on('error', (e) => { console.log('✗ Error: ' + e.message); resolve(); });
  });
};

async function run() {
  const paths = [...wpPaths];
  console.log('JS files to download: ' + paths.length);
  paths.slice(0,5).forEach(p => console.log(' ', p));
  
  for (const p of paths) {
    await downloadFile(p);
  }
  console.log('Done!');
}

run();
