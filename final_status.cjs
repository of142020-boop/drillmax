const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const bg = (html.match(/background-image\s*:\s*url/g) || []).length;
  const imgs = (html.match(/src="\/images\//g) || []).length;
  const size = Math.round(html.length / 1024);
  const hasLinks = (html.match(/href="https?:\/\/drilmax\.com/g) || []).length;
  console.log(f.padEnd(28) + size + 'KB | bg-imgs: ' + bg + ' | <img>: ' + imgs + ' | bad-links: ' + hasLinks);
});
