const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const html = fs.readFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw/home.html', 'utf8');
const $ = cheerio.load(html);

const content = [];

$('h1, h2, h3, h4, h5, h6, p, a.elementor-button, img').each((i, el) => {
  const tag = el.tagName.toLowerCase();
  
  // Ignore header/footer if possible, but let's grab everything for now
  if ($(el).closest('header, footer').length > 0) return;

  if (tag === 'img') {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    if (src && !src.startsWith('data:')) {
      content.push(`[IMAGE] src: ${src} | alt: ${alt}`);
    }
  } else if (tag === 'a') {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const href = $(el).attr('href');
    if (text) {
      content.push(`[BUTTON] text: ${text} | link: ${href}`);
    }
  } else {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text) {
      content.push(`[${tag.toUpperCase()}] ${text}`);
    }
  }
});

fs.writeFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/home_content.txt', content.join('\n'));
console.log('Extracted content to home_content.txt');
