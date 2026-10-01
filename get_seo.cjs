const cheerio = require('cheerio');
fetch('https://drilmax.com/prices/')
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log("TITLE:", $('title').text());
    console.log("DESC:", $('meta[name="description"]').attr('content'));
  });
