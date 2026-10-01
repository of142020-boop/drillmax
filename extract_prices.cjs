const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('src/raw/prices.html', 'utf-8');
const $ = cheerio.load(html);

// Remove scripts, styles, svgs
$('script, style, svg').remove();

const content = [];

// Try to grab the main Elementor content div
const mainElementor = $('.elementor-widget-wrap').parent(); // rough grab
if (mainElementor.length === 0) {
  // fallback
}

$('h1, h2, h3, h4, h5, h6, p, a.elementor-button-link, img').each((i, el) => {
  const tag = el.tagName.toLowerCase();
  
  // Exclude header/footer links if possible by checking parents, but let's just grab everything for now and filter manually if needed.
  if ($(el).parents('.elementor-location-header, .elementor-location-footer').length > 0) return;
  
  if (tag === 'img') {
    const src = $(el).attr('src');
    if (src && !src.includes('data:image')) {
      content.push(`[IMAGE] src: ${src} | alt: ${$(el).attr('alt')}`);
    }
  } else if (tag === 'a') {
    content.push(`[BUTTON] text: ${$(el).text().trim().replace(/\\s+/g, ' ')} | link: ${$(el).attr('href')}`);
  } else {
    const text = $(el).text().trim().replace(/\\s+/g, ' ');
    if (text.length > 2) {
      content.push(`[${tag.toUpperCase()}] ${text}`);
    }
  }
});

fs.writeFileSync('prices_content.txt', content.join('\\n'));
console.log('Done writing prices_content.txt');
