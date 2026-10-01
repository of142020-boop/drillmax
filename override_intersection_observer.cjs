const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

// The Elementor lazy_load_background_images setting controls whether backgrounds
// are loaded immediately or lazily via IntersectionObserver.
// Setting it to false (!1) means load immediately.
// But even with !0 (false), Elementor still processes via JS.
// 
// The REAL fix: inject a script that runs Elementor's own background loading immediately
// without waiting for IntersectionObserver.
//
// Elementor stores element settings in window.elementorFrontendConfig.settings.
// The actual per-element CSS is generated and injected via elementorFrontend.init()
// 
// Strategy: Add an early script that:
// 1. Overrides Elementor's lazy background observer
// 2. Forces all e-parent containers to load immediately

const fixScript = `<script>
// Force Elementor to load all background images immediately (no lazy loading)
(function() {
  // Override IntersectionObserver for Elementor lazy backgrounds
  var _OriginalIO = window.IntersectionObserver;
  window.IntersectionObserver = function(callback, options) {
    // Call the callback immediately with isIntersecting=true for all entries
    var observer = {
      observe: function(el) {
        // Simulate intersection immediately
        setTimeout(function() {
          callback([{
            target: el,
            isIntersecting: true,
            intersectionRatio: 1
          }], observer);
        }, 0);
      },
      unobserve: function() {},
      disconnect: function() {}
    };
    return observer;
  };
  
  // Also force all e-con.e-parent to have e-lazyloaded class
  function addLazyLoadedClass() {
    document.querySelectorAll('.e-con.e-parent, .e-con[data-element_type]').forEach(function(el) {
      el.classList.add('e-lazyloaded', 'e-no-lazyload');
    });
    // Also handle elementor sections/columns
    document.querySelectorAll('.elementor-section, .elementor-column, .elementor-widget').forEach(function(el) {
      if (el.classList.contains('elementor-invisible')) {
        el.classList.remove('elementor-invisible');
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      }
    });
  }
  
  // Run immediately and on DOMContentLoaded
  addLazyLoadedClass();
  document.addEventListener('DOMContentLoaded', addLazyLoadedClass);
  document.addEventListener('DOMContentLoaded', function() {
    // Re-run after a short delay to catch dynamically added elements
    setTimeout(addLazyLoadedClass, 100);
    setTimeout(addLazyLoadedClass, 500);
  });
})();
</script>`;

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Remove any existing fix script
  html = html.replace(/<script>\s*\/\/ Force Elementor to load all background[\s\S]*?<\/script>/g, '');
  
  // Insert the fix script right after <head> (before any other scripts)
  const headIdx = html.indexOf('<head>');
  if (headIdx === -1) {
    console.log('[SKIP] ' + filename + ': no <head> tag');
    return;
  }
  
  const insertPos = headIdx + '<head>'.length;
  html = html.slice(0, insertPos) + fixScript + html.slice(insertPos);
  
  // Also change lazy_load_background_images from !0 to !1 (disable lazy loading)
  html = html.replace(/"lazy_load_background_images":!0/g, '"lazy_load_background_images":!1');
  
  fs.writeFileSync(path.join(RAW_DIR, filename), html);
  totalFixed++;
  console.log('[FIXED] ' + filename);
});

console.log('\n✅ Done! Added IntersectionObserver override to ' + totalFixed + ' files.');
console.log('This forces Elementor to load ALL background images immediately without JS lazy-loading.');
