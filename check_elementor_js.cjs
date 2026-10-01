const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

// The Elementor JS config is in a script block that contains elementorFrontendConfig
// and elementorWidgetsConfig which have the background image URLs
// We need to find these and inject them as CSS

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Find all script blocks that contain elementorFrontendConfig
  const scriptIdx = html.indexOf('elementorFrontendConfig');
  if (scriptIdx !== -1) {
    console.log(filename + ': HAS elementorFrontendConfig at pos ' + scriptIdx);
  }
  
  // Find elementor widget data that has background_image
  const bgImgIdx = html.indexOf('background_image');
  if (bgImgIdx !== -1) {
    console.log(filename + ': HAS background_image reference at pos ' + bgImgIdx);
    // Show context
    console.log('  Context: ' + html.slice(bgImgIdx - 20, bgImgIdx + 150));
  }
});
