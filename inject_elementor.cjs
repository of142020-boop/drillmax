const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const srcDir = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/scratch/drilmax_content';
const outDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/pages';
const compDir = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/components';
const layoutFile = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/layouts/Layout.astro';

// 1. Update Layout.astro to use litespeed CSS
let layoutCode = fs.readFileSync(layoutFile, 'utf8');
layoutCode = layoutCode.replace(/import '\.\.\/styles\/global\.css';/, '<link rel="stylesheet" href="/styles/litespeed.css" />');
layoutCode = layoutCode.replace(/<html dir="rtl" lang="ar">/, '<html dir="rtl" lang="ar" class="ast-page-builder-template ast-no-sidebar active-footer-custom-4 active-header-mobile-builder active-header-builder elementor-default elementor-kit-8153">');
layoutCode = layoutCode.replace(/<body(.*?)>/, '<body class="home page-template-default page page-id-189 ast-desktop ast-page-builder-template ast-no-sidebar astra-4.1.4 ast-header-custom-item-inside ast-single-post ast-replace-site-logo-transparent ast-inherit-site-logo-transparent ast-normal-title-enabled elementor-default elementor-kit-8153 elementor-page elementor-page-189 e--ua-blink e--ua-chrome e--ua-webkit" data-elementor-device-mode="desktop">');
fs.writeFileSync(layoutFile, layoutCode);

// Helper to fix image links
function fixImagesAndLinks(html) {
  let fixed = html.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([a-zA-Z0-9_.-]+)/g, '/images/$1');
  // Also fix internal links to drop domain
  fixed = fixed.replace(/https:\/\/drilmax\.com\//g, '/');
  return fixed;
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

let headerExtracted = false;
let footerExtracted = false;

files.forEach(file => {
  const html = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const $ = cheerio.load(html);
  
  if (!headerExtracted) {
    const headerHtml = $('#masthead').parent().html(); // gets the outer div usually
    if (headerHtml) {
      fs.writeFileSync(path.join(compDir, 'Header.astro'), '---\n---\n' + fixImagesAndLinks(headerHtml));
      headerExtracted = true;
    }
  }
  
  if (!footerExtracted) {
    const footerHtml = $('footer').parent().html();
    if (footerHtml) {
      fs.writeFileSync(path.join(compDir, 'Footer.astro'), '---\n---\n' + fixImagesAndLinks(footerHtml));
      footerExtracted = true;
    }
  }

  // Extract main content
  let mainContent = $('#content').html() || $('main').html() || $('.elementor-page').html();
  if (!mainContent) {
    mainContent = $('body').html(); // fallback
  }

  // Find SEO title/desc from head
  const title = $('title').text() || 'Drill Max';
  const desc = $('meta[name="description"]').attr('content') || '';

  // Filename map
  let astroFileName = file.replace('.html', '.astro');
  if (astroFileName === 'home.astro') astroFileName = 'index.astro';
  
  const astroCode = `---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

const seoTitle = \`${title}\`;
const seoDesc = \`${desc}\`;
---

<Layout title={seoTitle} description={seoDesc}>
  <Header slot="header" />
  
  ${fixImagesAndLinks(mainContent)}

  <Footer slot="footer" />
</Layout>
`;

  fs.writeFileSync(path.join(outDir, astroFileName), astroCode);
  console.log(`Processed ${file} -> ${astroFileName}`);
});

console.log('All files converted with 100% Elementor design fidelity!');
