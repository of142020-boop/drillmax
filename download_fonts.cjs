const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BASE_URL = 'https://drilmax.com';
const PUBLIC_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public';

// Critical font and CSS files needed for Elementor/Astra to render correctly
const CRITICAL_FILES = [
  // Elementor Icon Fonts
  '/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.eot?5.50.0',
  '/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.woff2?5.50.0',
  '/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.woff?5.50.0',
  '/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.ttf?5.50.0',
  // Font Awesome
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-brands-400.woff2',
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-brands-400.woff',
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-brands-400.ttf',
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.woff2',
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.woff',
  '/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.ttf',
];

const downloadFile = (filePath) => {
  return new Promise((resolve) => {
    // Strip query params for local filename
    const cleanPath = filePath.split('?')[0];
    const localPath = path.join(PUBLIC_DIR, cleanPath);
    const localDir = path.dirname(localPath);

    if (fs.existsSync(localPath)) {
      console.log('Already exists: ' + cleanPath);
      return resolve();
    }

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const fullUrl = BASE_URL + filePath;
    console.log('Downloading: ' + fullUrl);

    const client = fullUrl.startsWith('https') ? https : http;
    client.get(fullUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        console.log('Redirect to: ' + redirectUrl);
        const client2 = redirectUrl.startsWith('https') ? https : http;
        client2.get(redirectUrl, (res2) => {
          const stream = fs.createWriteStream(localPath);
          res2.pipe(stream);
          stream.on('finish', () => { stream.close(); console.log('✓ ' + cleanPath); resolve(); });
        }).on('error', (e) => { console.log('✗ Error (redirect): ' + cleanPath + ' - ' + e.message); resolve(); });
      } else if (res.statusCode === 200) {
        const stream = fs.createWriteStream(localPath);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); console.log('✓ ' + cleanPath); resolve(); });
      } else {
        console.log('✗ HTTP ' + res.statusCode + ': ' + cleanPath);
        resolve();
      }
    }).on('error', (e) => { console.log('✗ Error: ' + cleanPath + ' - ' + e.message); resolve(); });
  });
};

async function run() {
  for (const file of CRITICAL_FILES) {
    await downloadFile(file);
  }
  console.log('\n✅ Done downloading critical font files!');
  console.log('The Elementor icons and Font Awesome should now render correctly.');
}

run();
