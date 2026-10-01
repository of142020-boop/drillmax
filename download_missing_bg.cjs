const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://drilmax.com';
const PUBLIC_IMAGES = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/images';

// Missing images to download
const missingImages = [
  '/wp-content/uploads/2025/07/منشار-خرسانة.webp',
  '/wp-content/uploads/2025/07/كور-دريل-1.webp',
];

const downloadImage = (wpPath) => {
  return new Promise((resolve) => {
    const filename = path.basename(wpPath);
    const localPath = path.join(PUBLIC_IMAGES, filename);
    
    if (fs.existsSync(localPath)) {
      console.log('Already exists: ' + filename);
      return resolve();
    }
    
    const fullUrl = BASE_URL + wpPath;
    console.log('Downloading: ' + filename);
    
    https.get(fullUrl, (res) => {
      if (res.statusCode === 200) {
        const stream = fs.createWriteStream(localPath);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); console.log('✓ ' + filename); resolve(); });
      } else {
        console.log('✗ HTTP ' + res.statusCode + ': ' + filename + ' - trying 2026 folder...');
        // Try different year
        const altPath = wpPath.replace('/2025/', '/2026/');
        https.get(BASE_URL + altPath, (res2) => {
          if (res2.statusCode === 200) {
            const stream = fs.createWriteStream(localPath);
            res2.pipe(stream);
            stream.on('finish', () => { stream.close(); console.log('✓ (alt) ' + filename); resolve(); });
          } else {
            console.log('✗ Also failed with alt path: ' + res2.statusCode);
            resolve();
          }
        }).on('error', () => resolve());
        res.resume(); // consume original response
      }
    }).on('error', (e) => { console.log('✗ Error: ' + e.message); resolve(); });
  });
};

async function run() {
  for (const img of missingImages) {
    await downloadImage(img);
  }
  console.log('\nDone!');
}

run();
