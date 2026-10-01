const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('src/raw/projects.html', 'utf8');
const $ = cheerio.load(html);
$('script, style, nav, footer, header').remove();
fs.writeFileSync('projects_clean.txt', $('body').text().replace(/\s+/g, ' ').trim());
