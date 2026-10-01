const fs = require('fs');
const path = require('path');

const rawDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  let html = fs.readFileSync(path.join(rawDir, filename), 'utf8');

  // Fix ALL attributes that contain drilmax.com
  // content= (og:url, canonical)
  html = html.replace(/content="https?:\/\/drilmax\.com\//g, 'content="http://localhost:4321/');
  html = html.replace(/content='https?:\/\/drilmax\.com\//g, "content='http://localhost:4321/");
  
  // OG image / twitter image - keep as-is since they're absolute
  // But fix navigation/button ones
  
  // data-* attributes
  html = html.replace(/data-[a-z-]+="https?:\/\/drilmax\.com\//g, 'data-url="http://localhost:4321/');

  // src= for scripts/iframes (not images - already handled)
  // Only fix wp-admin/wp-includes references that are navigation
  
  // JSON-LD structured data
  html = html.replace(/"@id":"https?:\\\/\\\/drilmax\.com\\\//g, '"@id":"http:\\/\\/localhost:4321\\/');
  html = html.replace(/"url":"https?:\\\/\\\/drilmax\.com\\\//g, '"url":"http:\\/\\/localhost:4321\\/');
  html = html.replace(/"@id":"https?:\/\/drilmax\.com\//g, '"@id":"http://localhost:4321/');
  html = html.replace(/"url":"https?:\/\/drilmax\.com\//g, '"url":"http://localhost:4321/');
  html = html.replace(/"logo":"https?:\/\/drilmax\.com\//g, '"logo":"http://localhost:4321/');
  html = html.replace(/"image":"https?:\/\/drilmax\.com\//g, '"image":"http://localhost:4321/');
  
  const remaining = (html.match(/drilmax\.com/g) || []).length;
  fs.writeFileSync(path.join(rawDir, filename), html);
  console.log(filename + ': ' + remaining + ' refs remaining');
});

console.log('\nDone! Any remaining drilmax.com refs are external resources (fonts/CDNs)');
