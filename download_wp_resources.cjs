const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://drilmax.com';
const PUBLIC_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public';

// Read home.html and extract ALL /wp-content/ resource paths
const html = fs.readFileSync('./src/raw/home.html', 'utf8');

const wpPaths = new Set();

// Match src= and url( references that point to /wp-content/
const matches1 = html.match(/src="(\/wp-content\/[^"?]+)/g) || [];
const matches2 = html.match(/url\((\/wp-content\/[^)?"]+)/g) || [];
const matches3 = html.match(/href="(\/wp-content\/[^"?]+)/g) || [];

[...matches1, ...matches2, ...matches3].forEach(m => {
  const cleaned = m.replace(/^(src="|href="|url\()/, '').replace(/[")]/g, '').trim();
  if (cleaned.startsWith('/wp-content/')) wpPaths.add(cleaned);
});

const downloadFile = (filePath) => {
  return new Promise((resolve) => {
    const localPath = path.join(PUBLIC_DIR, filePath);
    const localDir = path.dirname(localPath);

    if (fs.existsSync(localPath)) {
      return resolve(); // Skip already downloaded
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
        stream.on('finish', () => { stream.close(); console.log('✓ ' + filePath); resolve(); });
        stream.on('error', () => resolve());
      } else {
        console.log('✗ ' + res.statusCode + ' - ' + filePath);
        resolve();
      }
    }).on('error', () => { resolve(); });
  });
};

async function run() {
  const paths = [...wpPaths];
  console.log('Found ' + paths.length + ' wp-content resources to download...');
  
  for (const p of paths) {
    await downloadFile(p);
  }
  
  console.log('\n✅ Done! All wp-content resources downloaded.');
}

run();
