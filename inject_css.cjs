const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';

// Extract the complete inline CSS from home.html (which has the full CSS)
const homeHtml = fs.readFileSync(path.join(RAW_DIR, 'home.html'), 'utf8');

// Extract <style id="litespeed-ucss"> content
const ucssStart = homeHtml.indexOf('<style id="litespeed-ucss">');
const ucssEnd = homeHtml.indexOf('</style>', ucssStart) + '</style>'.length;
const ucssBlock = homeHtml.slice(ucssStart, ucssEnd);

if (!ucssBlock) {
  console.log('ERROR: Could not find litespeed-ucss block!');
  process.exit(1);
}

console.log('Found litespeed-ucss block: ' + Math.round(ucssBlock.length / 1024) + 'KB');

// Extract <style id="astra-theme-css-inline-css"> 
const astraStart = homeHtml.indexOf('<style id="astra-theme-css-inline-css">');
const astraEnd = homeHtml.indexOf('</style>', astraStart) + '</style>'.length;
const astraBlock = astraStart !== -1 ? homeHtml.slice(astraStart, astraEnd) : '';
console.log('Found astra-theme-css block: ' + Math.round(astraBlock.length / 1024) + 'KB');

// Extract inline style block with background-image styles (elementor-element styles)
// These are usually in a <style> tag after the main CSS
const elementorStyleStart = homeHtml.indexOf('<style id="elementor-post-');
let elementorBlock = '';
if (elementorStyleStart !== -1) {
  const elementorStyleEnd = homeHtml.indexOf('</style>', elementorStyleStart) + '</style>'.length;
  elementorBlock = homeHtml.slice(elementorStyleStart, elementorStyleEnd);
  console.log('Found elementor-post style block: ' + Math.round(elementorBlock.length / 1024) + 'KB');
}

// Find ALL <style> blocks from home.html to inject into other pages
const allHomeStyles = [];
let pos = 0;
while (pos < homeHtml.length) {
  const styleStart = homeHtml.indexOf('<style', pos);
  if (styleStart === -1) break;
  const styleEnd = homeHtml.indexOf('</style>', styleStart) + '</style>'.length;
  const styleBlock = homeHtml.slice(styleStart, styleEnd);
  // Only get the larger/important CSS blocks (skip tiny ones)
  if (styleBlock.length > 500) {
    allHomeStyles.push({ id: styleBlock.match(/id="([^"]+)"/) ? styleBlock.match(/id="([^"]+)"/)[1] : 'unknown', block: styleBlock });
  }
  pos = styleEnd;
}
console.log('\nAll significant style blocks from home.html: ' + allHomeStyles.length);
allHomeStyles.forEach(s => console.log('  ' + s.id + ': ' + Math.round(s.block.length/1024) + 'KB'));

// The combined CSS to inject into all pages that are missing it
const cssToInject = ucssBlock + '\n' + astraBlock + '\n' + elementorBlock;

// Process all other raw files
const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html') && f !== 'home.html');
let fixedCount = 0;

rawFiles.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  
  // Check if this page already has litespeed-ucss
  if (html.includes('litespeed-ucss')) {
    console.log('\n[SKIP] ' + filename + ' already has litespeed-ucss');
    return;
  }
  
  // Find the </head> tag and inject the CSS before it
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) {
    console.log('\n[WARN] ' + filename + ' has no </head> tag!');
    return;
  }
  
  html = html.slice(0, headEnd) + '\n' + cssToInject + '\n' + html.slice(headEnd);
  fs.writeFileSync(path.join(RAW_DIR, filename), html);
  fixedCount++;
  console.log('\n[FIXED] ' + filename + ' - injected ' + Math.round(cssToInject.length/1024) + 'KB of CSS');
});

console.log('\n✅ Done! Injected CSS into ' + fixedCount + ' pages.');
