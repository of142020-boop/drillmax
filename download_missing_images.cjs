const fs = require('fs');
const path = require('path');
const https = require('https');

const astroDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';
const imgDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/images';

const files = fs.readdirSync(astroDir).filter(f => f.endsWith('.astro'));
const imagesToDownload = new Set();

// Find all missing images
files.forEach(f => {
  const code = fs.readFileSync(path.join(astroDir, f), 'utf8');
  const matches = [...code.matchAll(/src="\/images\/([^"]+)"/g)];
  
  matches.forEach(match => {
    const filename = match[1];
    const filepath = path.join(imgDir, filename);
    if (!fs.existsSync(filepath)) {
      imagesToDownload.add(filename);
    }
  });
});

console.log(`Found ${imagesToDownload.size} missing images.`);

const download = (filename) => {
  return new Promise((resolve, reject) => {
    // The original paths were in 2025/07, 2025/08, 2025/09, 2025/10, etc.
    // Since we flattened the directory, we don't know the exact month.
    // Let's try 2025/10, 2025/09, 2025/08, 2025/07, 2025/11, 2025/06
    const months = ['10', '09', '08', '07', '11', '06', '12', '05'];
    
    let attempt = 0;
    
    const tryNext = () => {
      if (attempt >= months.length) {
        console.log('Could not find ' + filename + ' on server.');
        return resolve();
      }
      
      const month = months[attempt];
      attempt++;
      
      // Some might be 2026!
      let year = '2025';
      if (month === '02' || month === '01') year = '2026'; // if there's any
      
      const url = `https://drilmax.com/wp-content/uploads/${year}/${month}/${encodeURI(filename)}`;
      
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(path.join(imgDir, filename));
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log('Downloaded: ' + filename + ' from ' + url);
            resolve();
          });
        } else {
          tryNext();
        }
      }).on('error', () => {
        tryNext();
      });
    };
    
    tryNext();
  });
};

async function run() {
  for (const file of imagesToDownload) {
    await download(file);
  }
}

run();
