const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

const brokenPages = ['prices.html', 'exhaust-fans.html', 'blog.html', 'projects.html'];

// Read services.html to extract its inlined CSS
const servicesHtml = fs.readFileSync(path.join(RAW_DIR, 'services.html'), 'utf8');

// Find all <style>/* inlined: ... */ ... </style>
const styleRegex = /<style>\/\*\s*inlined:[^*]+\*\/[\s\S]*?<\/style>/g;
const inlinedStyles = servicesHtml.match(styleRegex) || [];

console.log('Found ' + inlinedStyles.length + ' inlined style blocks in services.html');

brokenPages.forEach(page => {
  let html = fs.readFileSync(path.join(RAW_DIR, page), 'utf8');
  
  // Remove any existing inlined styles to avoid duplication
  html = html.replace(/<style>\/\*\s*inlined:[^*]+\*\/[\s\S]*?<\/style>/g, '');
  
  // Also remove elementor-post css if it exists but is broken
  html = html.replace(/<link[^>]+elementor-post-\d+\.css[^>]+>/g, '');
  
  // Inject the styles from services.html into the <head>
  const headIdx = html.indexOf('</head>');
  if (headIdx !== -1) {
    const combinedStyles = '\n' + inlinedStyles.join('\n') + '\n';
    html = html.slice(0, headIdx) + combinedStyles + html.slice(headIdx);
    fs.writeFileSync(path.join(RAW_DIR, page), html);
    console.log('✓ Fixed CSS for ' + page);
  } else {
    console.log('✗ No <head> found in ' + page);
  }
});
