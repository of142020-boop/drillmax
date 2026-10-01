const https = require('https');
const fs = require('fs');
const path = require('path');

// The litespeed CSS file contains all the background-image styles
// We need to download it and embed it in all pages

// First, let's find the litespeed CSS URL from home.html (it was replaced earlier)
// Let's look at the ORIGINAL content (before our fixes) to find the CSS URL
const ORIGINAL_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/scratch/drilmax_content';

const html = fs.readFileSync(path.join(ORIGINAL_DIR, 'home.html'), 'utf8');

// Find all <link rel="stylesheet" href="..."> 
const cssLinks = [];
let pos = 0;
while (pos < html.length) {
  const s = html.indexOf('<link', pos);
  if (s === -1) break;
  const e = html.indexOf('>', s);
  const tag = html.slice(s, e + 1);
  if (tag.includes('stylesheet')) {
    const m = tag.match(/href="([^"]+)"/);
    if (m) cssLinks.push(m[1]);
  }
  pos = e + 1;
}

console.log('CSS files found in original home.html:');
cssLinks.forEach(l => console.log(' ', l));

// Also find link preload
const preloadLinks = [];
pos = 0;
while (pos < html.length) {
  const s = html.indexOf('<link', pos);
  if (s === -1) break;
  const e = html.indexOf('>', s);
  const tag = html.slice(s, e + 1);
  if (tag.includes('preload') && tag.includes('.css')) {
    const m = tag.match(/href="([^"]+)"/);
    if (m) preloadLinks.push(m[1]);
  }
  pos = e + 1;
}

if (preloadLinks.length > 0) {
  console.log('\nPreload CSS found:');
  preloadLinks.forEach(l => console.log(' ', l));
}
