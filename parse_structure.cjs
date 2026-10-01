const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('src/raw/projects.html', 'utf8');
const $ = cheerio.load(html);

const structure = [];

$('img').each((i, el) => {
  const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
  const alt = $(el).attr('alt') || '';
  if (src && !src.includes('data:image')) {
    structure.push(`[IMG] src: ${src} | alt: ${alt}`);
  }
});

$('iframe').each((i, el) => {
  const src = $(el).attr('src');
  structure.push(`[IFRAME/VIDEO] src: ${src}`);
});

$('video').each((i, el) => {
  const src = $(el).attr('src');
  structure.push(`[VIDEO] src: ${src}`);
});

fs.writeFileSync('core_structure.txt', structure.join('\n'));
console.log('Images and Videos extracted to core_structure.txt');
