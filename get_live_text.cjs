const cheerio = require('cheerio');
fetch('https://drilmax.com/prices/')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    console.log($('body').text().replace(/\s+/g, ' ').trim());
  });
