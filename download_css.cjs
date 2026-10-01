const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/scratch/drilmax_content/home.html', 'utf8');
const $ = cheerio.load(html);

let cssUrl = '';
$('link[rel="stylesheet"]').each((i, el) => {
  const href = $(el).attr('href');
  if (href && href.includes('litespeed/css')) {
    cssUrl = href;
  }
});

if (cssUrl) {
  console.log('Found CSS URL:', cssUrl);
  if (cssUrl.startsWith('//')) cssUrl = 'https:' + cssUrl;
  
  https.get(cssUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.mkdirSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/styles', { recursive: true });
      fs.writeFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/styles/old-style.css', data);
      console.log('CSS downloaded!');
    });
  }).on('error', err => console.error(err));
} else {
  console.log('No Litespeed CSS found.');
}
