const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// Elementor lazy-loads background images via JavaScript using data-settings attribute
// The pattern is: data-settings="{&quot;background_background&quot;:&quot;classic&quot;}" 
// with the image url in the element style or computed dynamically
// 
// In the HTML, background images are usually already inlined as:
// style="background-image: url('/images/...')"
// OR the JS sets them from data-settings
//
// The fix: For elements with "elementor-element" class and background image set in data-settings,
// we need to extract the image URL and add it as inline style

const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

rawFiles.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // The Elementor lazyloaded backgrounds use data-settings with escaped JSON
  // Pattern: data-settings="{...&quot;background_image&quot;:{&quot;url&quot;:&quot;URL&quot;...}"
  // We decode & and extract the image URL
  
  // Approach: find all elements that have background-image in style already set
  // These should work. The problem might be Elementor JS that REPLACES or REMOVES
  // background-image styles based on lazy-loading
  
  // CRITICAL FIX: Remove any Elementor lazyload JS that would break backgrounds
  // The litespeed/elementor lazyload JS on background images uses IntersectionObserver
  // and sets background-image dynamically. Since our page loads without WP plugins,
  // these images might already be in inline styles.
  
  // Let's check what the actual issue is by counting background-image styles
  const bgStyleCount = (html.match(/background-image\s*:\s*url/g) || []).length;
  
  if (bgStyleCount > 0) {
    console.log(filename + ': has ' + bgStyleCount + ' background-image styles (should display fine)');
  } else {
    console.log(filename + ': WARNING - no background-image styles found!');
  }
  
  // ALSO: Fix the lazyload background observer by adding a script that 
  // immediately applies all data-bg-desktop / data-bg images
  // This handles any remaining lazy backgrounds
  const lazyFixScript = `
<script>
// Immediately apply all lazy-load background images (no IntersectionObserver needed)
document.addEventListener('DOMContentLoaded', function() {
  // Fix data-bg attributes
  document.querySelectorAll('[data-bg]').forEach(function(el) {
    el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
  });
  document.querySelectorAll('[data-bg-desktop]').forEach(function(el) {
    el.style.backgroundImage = 'url(' + el.dataset.bgDesktop + ')';
  });
  // Force all elementor-invisible elements to become visible
  document.querySelectorAll('.elementor-invisible').forEach(function(el) {
    el.classList.remove('elementor-invisible');
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });
  // Trigger background lazy loading class
  document.querySelectorAll('[class*="lazyload"]').forEach(function(el) {
    if (el.dataset.bg) el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
  });
});
</script>`;

  // Add the fix script before </body>
  if (!html.includes('Fix data-bg attributes')) {
    html = html.replace('</body>', lazyFixScript + '</body>');
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    console.log(' → Added lazyload fix script to ' + filename);
  }
});

console.log('\n✅ Done! Added background image lazy-load fix to all pages.');
