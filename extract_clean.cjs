const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('src/raw/prices.html', 'utf-8');
const $ = cheerio.load(html);

// Remove scripts, styles, svgs, header, footer
$('script, style, svg, header, footer, .elementor-location-header, .elementor-location-footer').remove();

// Grab all text
let text = $('body').text();

// Clean up whitespace
text = text.replace(/\\n\\s*\\n/g, '\\n').trim();

fs.writeFileSync('prices_clean.txt', text);
console.log('Saved to prices_clean.txt');
