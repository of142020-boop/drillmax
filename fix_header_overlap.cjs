const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// The pages that were broken and had their CSS forcefully injected
const brokenPages = ['prices.html', 'exhaust-fans.html', 'blog.html', 'projects.html'];

brokenPages.forEach(page => {
  let html = fs.readFileSync(path.join(RAW_DIR, page), 'utf8');
  
  // To fix the overlap with the header (which happens because we used services.html CSS
  // which might have different margins for its specific post ID), we can manually add 
  // margin-top to the first elementor-section.
  
  const fixCSS = `
  <style>
    /* Fix header overlap for recovered pages */
    .site-content { padding-top: 120px !important; }
    @media (max-width: 768px) {
      .site-content { padding-top: 80px !important; }
    }
  </style>
  `;
  
  // Inject into head
  if (!html.includes('Fix header overlap')) {
    html = html.replace('</head>', fixCSS + '</head>');
    fs.writeFileSync(path.join(RAW_DIR, page), html);
    console.log('✓ Added top padding fix to ' + page);
  }
});
