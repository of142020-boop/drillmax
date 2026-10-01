const fs = require('fs');
const https = require('https');

const cssUrl = 'https://drilmax.com/wp-content/litespeed/css/1a014b70a3205affd643cefb84cddf03.css?ver=9f443';

https.get(cssUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.mkdirSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/styles', { recursive: true });
    // Save to public dir
    fs.writeFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/styles/litespeed.css', data);
    console.log('CSS downloaded successfully!');
  });
}).on('error', err => console.error(err));
