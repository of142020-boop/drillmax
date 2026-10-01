const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const pages = [
  { url: 'https://drilmax.com/%d8%a7%d8%b3%d8%b9%d8%a7%d8%b1-%d9%81%d8%aa%d8%ad%d8%a7%d8%aa-%d8%a7%d9%84%d9%83%d9%88%d8%b1/', name: 'prices.html' },
  { url: 'https://drilmax.com/%d9%81%d9%86%d9%8a-%d8%b4%d9%81%d8%a7%d8%b7%d8%a7%d8%aa/', name: 'exhaust-fans.html' },
  { url: 'https://drilmax.com/projects/', name: 'projects.html' },
  { url: 'https://drilmax.com/blog/', name: 'blog.html' }
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  for (const page of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1536, height: 800 });
    
    try {
      console.log('Fetching & Inlining: ' + page.name);
      await tab.goto(page.url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Inline all stylesheets within the page context
      await tab.evaluate(async () => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of links) {
          try {
            const res = await fetch(link.href);
            const text = await res.text();
            const style = document.createElement('style');
            style.textContent = '/* Inlined from ' + link.href + ' */\n' + text;
            link.parentNode.insertBefore(style, link);
            link.remove();
          } catch(e) {
            console.log('Failed to fetch ' + link.href);
          }
        }
      });
      
      // Extract the full HTML including DOCTYPE
      let html = await tab.evaluate(() => {
        return new XMLSerializer().serializeToString(document);
      });
      
      // --- APPLY ALL OUR FIXES ON THE FETCHED HTML ---
      
      // Fix image paths: wp-content/uploads -> /images/
      html = html.replace(/https:\/\/drilmax\.com\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
      html = html.replace(/\/wp-content\/uploads\/\d{4}\/\d{2}\//g, '/images/');
      html = html.replace(/-\d+x\d+\.(jpg|jpeg|png|webp|gif)/gi, '.$1');

      // Fix internal links
      html = html.replace(/href="https?:\/\/drilmax\.com\//g, 'href="/');
      html = html.replace(/action="https?:\/\/drilmax\.com\//g, 'action="/');
      
      // The Elementor lazy load fix
      const fixScript = `<script>
      (function() {
        var _OriginalIO = window.IntersectionObserver;
        window.IntersectionObserver = function(callback, options) {
          var observer = {
            observe: function(el) {
              setTimeout(function() { callback([{target: el, isIntersecting: true, intersectionRatio: 1}], observer); }, 0);
            },
            unobserve: function() {}, disconnect: function() {}
          };
          return observer;
        };
        function addLazyLoadedClass() {
          document.querySelectorAll('.e-con.e-parent, .e-con[data-element_type]').forEach(function(el) {
            el.classList.add('e-lazyloaded', 'e-no-lazyload');
          });
          document.querySelectorAll('.elementor-invisible').forEach(function(el) {
            el.classList.remove('elementor-invisible');
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          });
        }
        addLazyLoadedClass();
        document.addEventListener('DOMContentLoaded', addLazyLoadedClass);
        setTimeout(addLazyLoadedClass, 100);
      })();
      </script>
      <style>
        /* Fix header overlap for these specific pages on live site */
        .site-content { padding-top: 120px !important; }
        @media (max-width: 768px) {
          .site-content { padding-top: 80px !important; }
        }
      </style>`;
      
      html = html.replace(/<head[^>]*>/, '$&' + fixScript);
      html = html.replace(/"lazy_load_background_images":!0/g, '"lazy_load_background_images":!1');

      fs.writeFileSync(path.join(RAW_DIR, page.name), html);
      console.log('✓ Saved ' + page.name + ' (' + Math.round(html.length/1024) + 'KB)');
    } catch (e) {
      console.log('✗ Error for ' + page.name + ': ' + e.message);
    }
    
    await tab.close();
  }

  await browser.close();
}

run();
