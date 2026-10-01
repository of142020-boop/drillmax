const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/scratch/drilmax_content/home.html', 'utf8');
const $ = cheerio.load(html);
let bodyHtml = $('div[data-elementor-type="wp-page"]').parent().html();
if (!bodyHtml) bodyHtml = $('main').html();

// Fix lazy loaded images
bodyHtml = bodyHtml.replace(/src="data:image\/svg\+xml;base64,[^"]+"[^>]+data-src="([^"]+)"/g, 'src="$1"');
bodyHtml = bodyHtml.replace(/data-src="([^"]+)"[^>]+src="data:image\/svg\+xml;base64,[^"]+"/g, 'src="$1"');
bodyHtml = bodyHtml.replace(/srcset="[^"]+"/g, '');

// Fix arabic paths
bodyHtml = bodyHtml.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^"]+)/g, '/images/$1');
bodyHtml = bodyHtml.replace(/-[0-9]+x[0-9]+\.(jpg|jpeg|png|webp|svg|gif)/g, '.$1');

const astroCode = `---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<link rel="stylesheet" href="/css/litespeed.css" />

<Layout title="Drill Max Home">
  <Header slot="header" />
  
  <div class="elementor-body-wrapper">
    ${bodyHtml}
  </div>

  <Footer slot="footer" />
</Layout>

<style>
/* Reset any litespeed CSS that might break our header */
</style>
`;

fs.writeFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages/index.astro', astroCode);
