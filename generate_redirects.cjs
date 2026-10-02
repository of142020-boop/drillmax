const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf8'));

let redirects = {};

for (const post of posts) {
  const slug = decodeURIComponent(post.slug);
  
  if (slug.includes('شفاط') || slug.includes('مداخن')) {
    redirects['/' + slug] = '/فني-شفاطات/';
  } else if (slug.includes('واير')) {
    redirects['/' + slug] = '/%d9%82%d8%b5-%d8%a7%d9%84%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9-%d8%a8%d8%a7%d9%84%d9%88%d8%a7%d9%8a%d8%b1/';
  } else if (slug.includes('منشار')) {
    redirects['/' + slug] = '/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/';
  } else if (slug.includes('كور') || slug.includes('تخريم')) {
    redirects['/' + slug] = '/core-drilling-%d8%b5%d9%86%d8%a7%d9%8a%d8%b9%d9%8a-%d9%83%d9%88%d8%b1/';
  } else if (slug.includes('تزريع')) {
    redirects['/' + slug] = '/%d8%aa%d8%b2%d8%b1%d9%8a%d8%b9-%d8%a7%d9%84%d8%a7%d8%b4%d8%a7%d9%8a%d8%b1/';
  } else if (slug.includes('هدم')) {
    redirects['/' + slug] = '/مقاول-هدم/';
  } else {
    redirects['/' + slug] = '/services/';
  }
}

const configPath = path.join(__dirname, 'astro.config.mjs');
let config = fs.readFileSync(configPath, 'utf8');

// Find the redirects object and inject these inside
let redirectsString = '';
for (const [key, value] of Object.entries(redirects)) {
  redirectsString += "    '" + key + "': '" + value + "',\n";
}

// Inject into astro.config.mjs
config = config.replace(/redirects:\s*{/, 'redirects: {\n' + redirectsString);

fs.writeFileSync(configPath, config, 'utf8');
console.log('Successfully injected redirects into astro.config.mjs!');
