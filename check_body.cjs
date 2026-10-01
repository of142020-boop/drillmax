const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const html = fs.readFileSync(path.join(RAW_DIR, 'saw-cutting.html'), 'utf8');

// Find body tag and its class
const bodyMatch = html.match(/<body[^>]+>/);
if (bodyMatch) {
  console.log('Body tag:', bodyMatch[0].substring(0, 400));
} else {
  console.log('No body tag found!');
}

// Also look for post-id in any data attribute
const postMatches = html.match(/post.{0,5}id.{0,5}(\d{3,6})/gi);
if (postMatches) {
  console.log('\nPost ID mentions:', postMatches.slice(0, 5));
}
