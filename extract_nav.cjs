const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('src/raw/home.html', 'utf8');
const $ = cheerio.load(html);

console.log("=== HEADER LINKS ===");
// Find the header section, usually elementor-location-header or a specific class
let headerLinks = [];
$('header a, .elementor-location-header a').each((i, el) => {
    let text = $(el).text().trim().replace(/\s+/g, ' ');
    let href = $(el).attr('href');
    if (text && href) {
        headerLinks.push({ text, href });
    }
});
// Remove duplicates based on href and text
headerLinks = headerLinks.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.href === value.href && t.text === value.text
  ))
);
console.log(headerLinks);

console.log("\n=== FOOTER LINKS ===");
let footerLinks = [];
$('footer a, .elementor-location-footer a').each((i, el) => {
    let text = $(el).text().trim().replace(/\s+/g, ' ');
    let href = $(el).attr('href');
    if (text && href) {
        footerLinks.push({ text, href });
    }
});
footerLinks = footerLinks.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.href === value.href && t.text === value.text
  ))
);
console.log(footerLinks);
