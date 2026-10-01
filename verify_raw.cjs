const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const files = ['home.html', 'saw-cutting.html', 'core-drilling.html', 'about.html'];

files.forEach(f => {
  const html = fs.readFileSync(path.join(RAW_DIR, f), 'utf8');
  const hasBgImage = (html.match(/background-image\s*:\s*url/g) || []).length;
  const hasInlineStyle = (html.match(/id="litespeed-ucss"/g) || []).length;
  const hasDrilmaxRef = (html.match(/href="https?:\/\/drilmax\.com/g) || []).length;
  const sizeKB = Math.round(html.length / 1024);
  console.log(f + ':');
  console.log('  Size: ' + sizeKB + 'KB');
  console.log('  background-image count: ' + hasBgImage);
  console.log('  litespeed-ucss inline CSS: ' + (hasInlineStyle > 0 ? 'YES' : 'NO'));
  console.log('  remaining external hrefs: ' + hasDrilmaxRef);
});
